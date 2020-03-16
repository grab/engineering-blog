---
layout: post
id: 2020-03-16-tackling-ui-test-execution-time-imbalance-for-xcode-parallel-testing
title: Tackling UI test execution time imbalance for Xcode parallel testing
date: 2020-03-16 08:13:20
authors: [ngoc-thuyen-trinh]
categories: [Engineering]
tags: [xcode, testing, mobile, parallelism, UI tests, CI, iOS]
comments: true
cover_photo: /img/tackling-ui-test-execution-time-imbalance-for-xcode-parallel-testing/cover.png
excerpt: "This blog post introduces how we use Xcode parallel testing to balance test execution time and improve the parallelism of our systems. We also share how we overcame a challenge that prevented us from running the tests efficiently."
---

# Introduction

Testing is a common practice to ensure that code logic is not easily broken during development and refactoring. Having tests running as part of Continuous Integration (CI) infrastructure is essential, especially with a large codebase contributed by many engineers. However, the more tests we add, the longer it takes to execute. In the context of iOS development, the execution time of the whole test suite might be significantly affected by the increasing number of tests written. Running [CI pre-merge pipelines](https://about.gitlab.com/blog/2019/07/12/guide-to-ci-cd-pipelines/) against a change, would cost us more time. Therefore, reducing test execution time is a long term epic we have to tackle in order to build a good CI infrastructure.

Apart from splitting tests into subsets and running each of them in a CI job, we can also make use of the [Xcode parallel testing](https://www.zachsim.one/blog/2018/6/15/parallel-testing-in-xcode-10) feature to achieve parallelism within one single CI job. However, due to platform-specific implementations, there are some constraints that prevent parallel testing from working efficiently. One constraint we found is that tests of the same [Swift](https://swift.org/about/) class run on the same simulator. In this post, we will discuss this constraint in detail and introduce a tip to overcome it.

# Background

## Xcode parallel testing

The parallel testing feature was shipped as part of the [Xcode 10 release](https://developer.apple.com/documentation/xcode_release_notes/xcode_10_release_notes). This support enables us to easily configure test setup:

* There is no need to care about how to split a given test suite.
* The number of workers (i.e. parallel runners/instances) is configurable. We can pass this value in the `xcodebuild` CLI via the `-parallel-testing-worker-count` option.
* Xcode takes care of cloning and starts simulators accordingly.

However, *the distribution logic under the hood is a black-box*. We do not really know how *tests are assigned to each worker or simulator, and in which order*.


<div class="post-image-section"><figure>
  <img src="/img/tackling-ui-test-execution-time-imbalance-for-xcode-parallel-testing/image6.png" alt="Three simulators running tests in parallel">
  <figcaption align="middle"><i>Three simulators running tests in parallel</i></figcaption>
</figure></div>

It is worth mentioning that even without the Xcode parallel testing support, we can still achieve similar improvements by running subsets of tests in different child processes. But it takes more effort to dispatch tests to each child process in an efficient way, and to handle the output from each test process appropriately.

## Test time imbalance

Generally, a *parallel execution system* is at its best efficiency if each parallel task executes in roughly the same duration and ends at roughly the same time.

If the time spent on each parallel task is significantly different, it will take more time than expected to execute all tasks. For example, in the following image, it takes the system on the left 13 mins to finish 3 tasks. Whereas, the one on the right takes only 10.5 mins to finish those 3 tasks.

<div class="post-image-section"><figure>
  <img src="/img/tackling-ui-test-execution-time-imbalance-for-xcode-parallel-testing/image3.png" alt="Bad parallelism vs. good parallelism">
  <figcaption align="middle"><i>Bad parallelism vs. good parallelism</i></figcaption>
</figure></div>

Assume there are N workers. The i<sup>th</sup> worker executes its tasks in t<sub>i</sub> seconds/minutes. In the left plot, t<sub>1</sub> = 10 mins, t<sub>2</sub> = 7 mins, t<sub>3</sub> = 13 mins.

We define the test time imbalance metric as the difference between the min and max end time:

max(t<sub>i</sub>) - min(t<sub>i</sub>)

For the example above, the test time imbalance is 13 mins - 7 mins = 6 mins.

## Contributing factors in test time imbalance

There are several factors causing test time imbalance. The top two prominent factors are:

1. Tests vary in execution time.
2. Tests of the same class run on the same simulator.

An example of the first factor is that in our project, around 50% of tests execute in a range of 20-40 secs. Some tests take under 15 secs to run while several take up to 2 minutes. Sometimes tests taking longer execution time is inevitable since those tests usually touch many flows, which cannot be split. If such tests run last, the test time imbalance may increase.

However, this issue, in general, does not matter that much because long-time-execution tests do not always run last.

Regarding the second factor, there is no official Apple documentation that explicitly states this constraint. When [Apple first introduced parallel testing support in Xcode 10](https://developer.apple.com/documentation/xcode_release_notes/xcode_10_release_notes), they only mentioned that test classes are distributed across runner processes:

> “Test parallelization occurs by **distributing the test classes in a target across multiple runner processes**. Use the test log to see how your test classes were parallelized. You will see an entry in the log for each runner process that was launched, and below each runner you will see the list of classes that it executed.”

For example, we have a test class `JobFlowTests` that includes five tests and another test class `TutorialTests` that has only one single test.

```swift
final class JobFlowTests: BaseXCTestCase {
func testHappyFlow() { ... }
  func testRecoverFlow() { ... }
  func testJobIgnoreByDax() { ... }
  func testJobIgnoreByTimer() { ... }
  func testForceClearBooking() { ... }
}
...
final class TutorialTests: BaseXCTestCase {
  func testOnboardingFlow() { ... }
}
```

When executing the two tests with two simulators running in parallel, the actual run is like the one shown on the left side of the following image, but ideally it should work like the one on the right side.

<div class="post-image-section"><figure>
  <img src="/img/tackling-ui-test-execution-time-imbalance-for-xcode-parallel-testing/image1.png" alt="Tests of the same class are supposed to run on the same simulator but they should be able to run on different simulators.">
  <figcaption align="middle"><i>Tests of the same class are supposed to run on the same simulator but they should be able to run on different simulators.</i></figcaption>
</figure></div>


# Diving deep into Xcode parallel testing

## Demystifying Xcode scheduling log

As mentioned above, Xcode distributes tests to simulators/workers in a black-box manner. However, by looking at the scheduling log generated when running tests, we can understand how Xcode parallel testing works.

When running UI tests via the `xcodebuild` command:

```sh
$ xcodebuild -workspace Driver/Driver.xcworkspace \
    -scheme Driver \
    -configuration Debug \
    -sdk 'iphonesimulator' \
    -destination 'platform=iOS Simulator,id=EEE06943-7D7B-4E76-A3E0-B9A5C1470DBE' \
    -derivedDataPath './DerivedData' \
    -parallel-testing-enabled YES \
    -parallel-testing-worker-count 2 \
    -only-testing:DriverUITests/JobFlowTests \    # 👈👈👈👈👈
    -only-testing:DriverUITests/TutorialTests \
    test-without-building
```

The log can be found inside the `*.xcresult` folder under `DerivedData/Logs/Test`. For example: `DerivedData/Logs/Test/Test-Driver-2019.11.04\_23-31-34-+0800.xcresult/1\_Test/Diagnostics/DriverUITests-144D9549-FD53-437B-BE97-8A288855E259/scheduling.log`

<div class="post-image-section"><figure>
  <img src="/img/tackling-ui-test-execution-time-imbalance-for-xcode-parallel-testing/image5.png" alt="Scheduling log under xcresult folder.">
  <figcaption align="middle"><i>Scheduling log under xcresult folder</i></figcaption>
</figure></div>

```
2019-11-05 03:55:00 +0000: Received worker from worker provider: 0x7fe6a684c4e0 [0: Clone 1 of DaxIOS-XC10-1-iP7-1 (3D082B53-3159-4004-A798-EA5553C873C4)]
2019-11-05 03:55:13 +0000: Worker 0x7fe6a684c4e0 [4985: Clone 1 of DaxIOS-XC10-1-iP7-1 (3D082B53-3159-4004-A798-EA5553C873C4)] finished bootstrapping
2019-11-05 03:55:13 +0000: Parallelization enabled; test execution driven by the IDE
2019-11-05 03:55:13 +0000: Skipping test class discovery
2019-11-05 03:55:13 +0000: Executing tests {(	# 👈👈👈👈👈
    DriverUITests/JobFlowTests,
    DriverUITests/TutorialTests
)}; skipping tests {(
)}
2019-11-05 03:55:13 +0000: Load balancer requested an additional worker
2019-11-05 03:55:13 +0000: Dispatching tests {(  # 👈👈👈👈👈
    DriverUITests/JobFlowTests
)} to worker: 0x7fe6a684c4e0 [4985: Clone 1 of DaxIOS-XC10-1-iP7-1 (3D082B53-3159-4004-A798-EA5553C873C4)]
2019-11-05 03:55:13 +0000: Received worker from worker provider: 0x7fe6a1582e40 [0: Clone 2 of DaxIOS-XC10-1-iP7-1 (F640C2F1-59A7-4448-B700-7381949B5D00)]
2019-11-05 03:55:39 +0000: Dispatching tests {(  # 👈👈👈👈👈
    DriverUITests/TutorialTests
)} to worker: 0x7fe6a684c4e0 [4985: Clone 1 of DaxIOS-XC10-1-iP7-1 (3D082B53-3159-4004-A798-EA5553C873C4)]
...
```

Looking at the log below, we know that once a test class is dispatched or distributed to a worker/simulator, all tests of that class will be executed in that simulator.

```
2019-11-05 03:55:39 +0000: Dispatching tests {(
    DriverUITests/TutorialTests
)} to worker: 0x7fe6a684c4e0 [4985: Clone 1 of DaxIOS-XC10-1-iP7-1 (3D082B53-3159-4004-A798-EA5553C873C4)]
```

Even when we customize a test suite (by swizzling some `XCTestSuite` class methods or variables), to split a test suite into multiple suites, it does not work because the made-up test suite is only initialized after tests are dispatched to a given worker.

Therefore, ***any hook to bypass this constraint must be done early on***.

## Passing the -only-testing argument to xcodebuild command

Now we pass tests (instead of test classes) to the `-only-testing` argument.

```
$ xcodebuild -workspace Driver/Driver.xcworkspace \
    # ...
    -only-testing:DriverUITests/JobFlowTests/testJobIgnoreByTimer \
    -only-testing:DriverUITests/JobFlowTests/testRecoverFlow \
    -only-testing:DriverUITests/JobFlowTests/testJobIgnoreByDax \
    -only-testing:DriverUITests/JobFlowTests/testHappyFlow \
    -only-testing:DriverUITests/JobFlowTests/testForceClearBooking \
    -only-testing:DriverUITests/TutorialTests/testOnboardingFlow \
    test-without-building
```

But still, the scheduling log shows that ***tests are grouped by test class before being dispatched to workers*** (see the following log for reference). This grouping is automatically done by Xcode (which it should not).

```
2019-11-05 04:21:42 +0000: Executing tests {(	# 👈
    DriverUITests/JobFlowTests/testJobIgnoreByTimer,
    DriverUITests/JobFlowTests/testRecoverFlow,
    DriverUITests/JobFlowTests/testJobIgnoreByDax,
    DriverUITests/TutorialTests/testOnboardingFlow,
    DriverUITests/JobFlowTests/testHappyFlow,
    DriverUITests/JobFlowTests/testForceClearBooking
)}; skipping tests {(
)}
2019-11-05 04:21:42 +0000: Load balancer requested an additional worker
2019-11-05 04:21:42 +0000: Dispatching tests {(  # 👈 ❌
    DriverUITests/JobFlowTests/testJobIgnoreByTimer,
    DriverUITests/JobFlowTests/testForceClearBooking,
    DriverUITests/JobFlowTests/testJobIgnoreByDax,
    DriverUITests/JobFlowTests/testHappyFlow,
    DriverUITests/JobFlowTests/testRecoverFlow
)} to worker: 0x7fd781261940 [6300: Clone 1 of DaxIOS-XC10-1-iP7-1 (93F0FCB6-C83F-4419-9A75-C11765F4B1CA)]
......
```

# Overcoming grouping logic in Xcode parallel testing

## Tweaking the -only-testing argument values

Based on our observation, we can imagine how Xcode runs tests in parallel. See below.

```py
Step 1.   tests = detect_tests_to_run() # parse -only-testing arguments
Step 2.   groups_of_tests = group_tests_by_test_class(tests)
Step 3.   while groups_of_tests is not empty:
Step 3.1. 	worker = find_free_worker()
Step 3.2.     if worker is not None:
                  dispatch_tests_to_workers(groups_of_tests.pop())

```

In the pseudo-code above, we do not have much control to change step 2 since that grouping logic is implemented by Xcode. But we have a good guess that Xcode groups tests, by the first two components (class name) only (For example,  `DriverUITests/JobFlowTests`). In other words, tests having the same class name run together on one simulator.

The trick to break this constraint is simple. We can tweak the input (test names) so that each group contains only one test. By inserting a random token in the class name, all class names in the tests that are passed via `-only-testing` argument are different.

For example, instead of passing:
```sh
-only-testing:DriverUITests/JobFlowTests/testJobIgnoreByTimer \
-only-testing:DriverUITests/JobFlowTests/testRecoverFlow \
```

We rather use:
```sh
-only-testing:DriverUITests/JobFlowTests_AxY132z8/testJobIgnoreByTimer \
-only-testing:DriverUITests/JobFlowTests_By8MTk7l/testRecoverFlow \
```

Or we can use the test name itself as the token:
```sh
-only-testing:DriverUITests/JobFlowTests_testJobIgnoreByTimer/testJobIgnoreByTimer \
-only-testing:DriverUITests/JobFlowTests_testRecoverFlow/testRecoverFlow \
```

After that, looking at the scheduling log, we will see that the trick can bypass the grouping logic. Now, only one test is dispatched to a worker once ready.

```
2019-11-05 06:06:56 +0000: Dispatching tests {(	# 👈 ✅
    DriverUITests/JobFlowTests_testJobIgnoreByDax/testJobIgnoreByDax
)} to worker: 0x7fef7952d0e0 [13857: Clone 2 of DaxIOS-XC10-1-iP7-1 (9BA030CD-C90F-4B7A-B9A7-D12F368A5A64)]
2019-11-05 06:06:58 +0000: Dispatching tests {(	# 👈 ✅
    DriverUITests/TutorialTests_testOnboardingFlow/testOnboardingFlow
)} to worker: 0x7fef7e85fd70 [13719: Clone 1 of DaxIOS-XC10-1-iP7-1 (584F99FE-49C2-4536-B6AC-90B8A10F361B)]
2019-11-05 06:07:07 +0000: Dispatching tests {(	# 👈 ✅
    DriverUITests/JobFlowTests_testRecoverFlow/testRecoverFlow
)} to worker: 0x7fef7952d0e0 [13857: Clone 2 of DaxIOS-XC10-1-iP7-1 (9BA030CD-C90F-4B7A-B9A7-D12F368A5A64)]

```

## Handling tweaked test names

When a worker/simulator receives a request to run a test, the app (could be the runner app or the hosting app) initializes an `XCTestSuite` corresponding to the test name. In order for the test suite to be properly made up, we need to remove the inserted token.

This could be done easily by swizzling the [`XCTestSuite.init(forTestCaseWithName:)`](https://developer.apple.com/documentation/xctest/xctestsuite/1500897-init). Inside that swizzled function, we remove the token and then call the original init function.

```swift
extension XCTestSuite {
  /// For 'Selected tests' suite
  @objc dynamic class func swizzled_init(forTestCaseWithName maskedName: String) -> XCTestSuite {
    /// Recover the original test name
    /// - masked: UITestCaseA_testA1/testA1      	--> recovered: UITestCaseA/testA1
    /// - masked: Driver/UITestCaseA_testA1/testA1   --> recovered: Driver/UITestCaseA/testA1
    guard let testBaseName = maskedName.split(separator: "/").last else {
      return swizzled_init(forTestCaseWithName: maskedName)
    }
    let recoveredName = maskedName.replacingOccurrences(of: "_\(testBaseName)/", with: "/") # 👈 remove the token
    return swizzled_init(forTestCaseWithName: recoveredName) # 👈 call the original init
  }
}
```
<div class="post-image-section"><figure>
  <img src="/img/tackling-ui-test-execution-time-imbalance-for-xcode-parallel-testing/image2.png" alt="Swizzle function to run tests properly">
  <figcaption align="middle"><i>Swizzle function to run tests properly</i></figcaption>
</figure></div>

## Test class discovery

In order to adopt this tip, we need to know which test classes we need to run in advance. Although Apple does not provide an API to obtain the list before running tests, this can be done in several ways. One approach we can use is to generate test classes using [Sourcery](https://github.com/krzysztofzablocki/Sourcery). Another alternative is to parse the binaries inside `.xctest` bundles (in build products) to look for symbols related to tests.

# Conclusion

In this article, we identified some factors causing test execution time imbalance in Xcode parallel testing (particularly for UI tests).

We also looked into how Xcode distributes tests in parallel testing. We also try to mitigate a constraint in which tests within the same class run on the same simulator. The trick not only reduces the imbalance but also gives us more confidence in adding more tests to a class without caring about whether it affects our CI infrastructure.

Below is the metric about test time imbalance recorded when running UI tests. After adopting the trick, we saw a decrease in the metric (which is a good sign). As of now, the metric stabilizes at around 0.4 mins.

<div class="post-image-section"><figure>
  <img src="/img/tackling-ui-test-execution-time-imbalance-for-xcode-parallel-testing/image4.png" alt="Tracking data of UI test time imbalance (in minutes) in our project, collected by multiple runs">
  <figcaption align="middle"><i>Tracking data of UI test time imbalance (in minutes) in our project, collected by multiple runs</i></figcaption>
</figure></div>


# Join us
Grab is more than just the leading ride-hailing and mobile payments platform in Southeast Asia. We use data and technology to improve everything from transportation to payments and financial services across a region of more than 620 million people. We aspire to unlock the true potential of Southeast Asia and look for like-minded individuals to join us on this ride.

If you share our vision of driving South East Asia forward, [apply](https://grab.careers/jobs/) to join our team today.
