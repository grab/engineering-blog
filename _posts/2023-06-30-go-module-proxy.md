---
layout: post
id: 2023-06-30-go-module-proxy
title: Go module proxy at Grab
date: 2023-06-30 01:18:00
authors: [jerry-ng]
categories: [Engineering]
tags: [Engineering]
comments: true
cover_photo: /img/go-module-proxy/cover.png
excerpt: "While consolidating code into a single monorepo has its benefits, there are also several challenges that come with managing a large monorepo like slow performance and low developer productivity. Find out how Grab’s FLIP team contributes and leverages the open-sourced Athens Go module proxy to improve developer productivity at Grab."
---

At Grab, we rely heavily on [a large Go monorepo](/go-module-a-guide-for-monorepos-part-1) for backend development, which offers benefits like code reusability and discoverability. However, as we continue to grow, managing a large monorepo brings about its own set of unique challenges.

As an example, using Go commands such as `go get` and `go list` can be incredibly slow when fetching Go modules residing in a large [multi-module repository](https://github.com/golang/go/wiki/Modules#what-are-multi-module-repositories). This sluggishness takes a toll on developer productivity, burdens our Continuous Integration (CI) systems, and strains our Version Control System host (VCS), GitLab.

In this blog post, we look at how [Athens](https://github.com/gomods/athens), a Go module proxy, helps to improve the overall developer experience of engineers working with a large Go monorepo at Grab.

## Key highlights

- We reduced the time of executing the `go get` command from **~18 minutes** to **~12 seconds** when fetching monorepo Go modules.
- We scaled in and **scaled down our entire Athens cluster by 70%** by utilising the fallback network mode in Athens along with Golang's `GOVCS` mode, resulting in cost savings and enhanced efficiency.

## Problem statements and solutions

### 1. Painfully slow performance of Go commands

*Problem summary: Running the `go get` command in our monorepo takes a considerable amount of time and can lead to performance degradation in our VCS.*

When working with the Go programming language, `go get` is one of the most common commands that you’ll use every day. Besides developers, this command is also used by CI systems.

#### What does `go get` do?

The `go get` command is used to download and install packages and their dependencies in Go. Note that it operates differently depending on whether it is run in [legacy GOPATH mode](https://pkg.go.dev/cmd/go#hdr-Legacy_GOPATH_go_get) or module-aware mode. In Grab, we’re using the [module-aware mode](https://go.dev/ref/mod#mod-commands) in a [multi-module repository](https://github.com/golang/go/wiki/Modules#faqs--multi-module-repositories) setup.

<div class="post-image-section"><figure>
  <img src="img/go-module-proxy/image2.png" alt="" style="width:70%"><figcaption align="middle"></figcaption>
  </figure>
</div>

Every time `go get` is run, it uses Git commands, like `git ls-remote`, `git tag`, `git fetch`, etc, to search and download the entire worktree. The excessive use of these Git commands on our monorepo contributes to the long processing time and can be strenuous to our VCS.

#### How big is our monorepo?

To fully grasp the challenges faced by our engineering teams, it's crucial to understand the vast scale of the monorepo that we work with daily. For this, we use [git-sizer](https://github.com/github/git-sizer) to analyse our monorepo.

Here’s what we found:

*   **Overall repository size**: The monorepo has a total uncompressed size of **69.3 GiB**, a fairly substantial figure. To put things into perspective, the [Linux kernel repository](https://github.com/torvalds/linux), known for its vastness, currently stands at 55.8 GiB.
*   **Trees**: The total number of trees is 3.21M and tree entries are 99.8M, which consume 3.65 GiB. This may cause performance issues during some Git operations.
*   **References**: Totalling 10.7k references.
*   **Biggest checkouts**: There are 64.7k directories in our monorepo. This affects operations like `git status` and `git checkout`. Moreover, our monorepo has a maximum path depth of 20. This contributes to a slow processing time on Git and negatively impacts developer experience. The number of files (354k) and the total size of files (5.08 GiB) are also concerns due to their potential impact on the repository's performance.

To draw a comparison, refer to [the `git-sizer` output of the Linux repository](https://github.com/github/git-sizer/blob/0b6d3a21c6ccbd49463534a19cc1b3f71526c077/README.md#usage).

#### How slow is “slow”?

To illustrate the issue further, we will compare the time taken for various Go commands to fetch a single module in our monorepo at a 10 MBps download speed.

This is an example of how a module is structured in our monorepo:

```
gitlab.company.com/monorepo/go
  |-- go.mod
  |-- commons/util/gk
        |-- go.mod
```

<table class="table" border=1>
  <thead>
    <tr>
      <th>Go commands</th>
      <th>GOPROXY</th>
      <th>Previously cached?</th>
      <th>Description</th>
      <th>Result (time taken)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>go get -x gitlab.company.com/monorepo/go/commons/util/gk</code></td>
      <td>proxy.golang.org,direct</td>
      <td>Yes</td>
      <td>Download and install the latest version of the module. This is a common scenario that developers often encounter.</td>
      <td>18:50.71 minutes</td>
    </tr>
    <tr>
      <td><code>go get -x gitlab.company.com/monorepo/go/commons/util/gk</code></td>
      <td>proxy.golang.org,direct</td>
      <td>No</td>
      <td>Download and install the latest version of the module <strong>without any module cache</strong></td>
      <td>1:11:54.56 hour</td>
    </tr>
    <tr>
      <td><code>go list -x -m -json -versions gitlab.company.com/monorepo/go/util/gk</code></td>
      <td>proxy.golang.org,direct</td>
      <td>Yes</td>
      <td>List information about the module</td>
      <td>3.873 seconds</td>
    </tr>
    <tr>
      <td><code>go list -x -m -json -versions gitlab.company.com/monorepo/go/util/gk</code></td>
      <td>proxy.golang.org,direct</td>
      <td>No</td>
      <td>List information about the module <strong>without any module cache</strong></td>
      <td>3:18.58 minutes</td>
    </tr>
  </tbody>
</table>

In this example, using `go get` to fetch a module took over **18 minutes** to complete. If we needed to retrieve more than one module in our monorepo, it can be incredibly time-consuming.

#### Why is it slow in a monorepo?

In a large Go monorepo, `go get` commands can be slow due to several factors:

1.  **Large number of files and directories**: When running `go get`, the command needs to search and download the entire worktree. In a large multi-module monorepo, the vast number of files and directories make this search process very expensive and time-consuming.
2.  **Number of refs**: A large number of refs (branches or tags) in our monorepo can affect performance. Ref advertisements (`git ls-remote`), which contain every ref in our monorepo, are the first phase in any remote Git operation, such as `git clone` or `git fetch`. With a large number of refs, performance takes a hit when performing these operations.
3.  **Commit history traversal**: Operations that need to traverse a repository's commit history and consider each ref will be slow in a monorepo. The larger the monorepo, the more time-consuming these operations become.

#### The consequences: Stifled productivity and strained systems

##### Developers and CI

When Go command operations like `go get` are slow, they contribute to significant delays and inefficiencies in software development workflows. This leads to reduced productivity and demotivated developers.

Optimising Go command operations' speed is crucial to ensure efficient software development workflows and high-quality software products.

##### Version Control System

It's also worth noting that overusing `go get` commands can also lead to performance issues for VCS. When Go packages are frequently downloaded using `go get`, we saw that it caused a bottleneck in our VCS cluster, which can lead to performance degradation or even cause rate-limiting queue issues.

This negatively impacts the performance of our VCS infrastructure, causing delays or sometimes unavailability for some users and CI.

#### Solution: Athens + `fallback` Network Mode + `GOVCS` + Custom Cache Refresh Solution

*Problem summary: Speed up `go get` command by not fetching from our VCS*

We addressed the speed issue by using Athens, [a proxy server for Go modules](https://www.practical-go-lessons.com/chap-18-go-module-proxies#what-is-a-proxy-server) (read more about the [GOPROXY protocol](https://go.dev/ref/mod#goproxy-protocol)).

##### How does Athens work?

The following sequence diagram describes the default flow of `go get` command with Athens.

<div class="post-image-section"><figure>
  <img src="img/go-module-proxy/image1.png" alt="" style="width:70%"><figcaption align="middle"></figcaption>
  </figure>
</div>

Athens uses a [storage system](https://docs.gomods.io/configuration/storage/) for Go module packages, which can also be configured to use various storage systems such as Amazon S3, and Google Cloud Storage, among others.

By caching these module packages in storage, Athens can serve the packages directly from storage rather than requesting them from an upstream VCS while serving Go commands such as `go mod download` and [certain go build modes](https://go.dev/ref/mod#build-commands). However, just using a Go module proxy didn't fully resolve our issue since the **`go get` and `go list`** commands still hit our VCS through the proxy.

With this in mind, we thought "what if we could just serve the Go modules directly from Athens’ storage for `go get`?" This question led us to discover Athens network mode.

**What is Athens network mode?**

Athens `NetworkMode` configures how Athens will return the results of the Go commands. It can be assembled from both its own storage and the upstream VCS. As of [Athens v0.12.1](https://github.com/gomods/athens/releases/tag/v0.12.1), it currently supports these 3 modes:

1.  **strict**: merge VCS versions with storage versions, but fail if either of them fails.
2.  **offline**: only get storage versions, **never reach out to VCS**.
3.  **fallback**: only return storage versions, if VCS fails. Fallback mode does the best effort of giving you what's available at the time of requesting versions.

Our Athens clusters were initially set to use `strict` network mode, but this was not ideal for us. So we explored the other network modes.

**Exploring `offline` mode**

We initially sought to explore the idea of putting Athens in `offline` network mode, which would allow Athens to serve Go requests only from its storage. This concept aligned with our aim of reducing VCS hits while also leading to significant performance improvement in Go workflows.

<div class="post-image-section"><figure>
  <img src="img/go-module-proxy/image4.png" alt="" style="width:70%"><figcaption align="middle"></figcaption>
  </figure>
</div>

However in practice, it's not an ideal approach. The default Athens setup (`strict` mode) automatically updates the module version when a user requests a new module version. Nevertheless, switching Athens to `offline` mode would disable the automatic updates as it wouldn't connect to the VCS.

**Custom cache refresh solution**

To solve this, we implemented a CI pipeline that refreshes Athens' module cache whenever a new module is released in our monorepo. Employing this with `offline` mode made Athens effective for the monorepo but it resulted in the loss of automatic updates for other repositories

Restoring this feature requires applying our custom cache refresh solution to all other Go repositories. However, implementing this workaround can be quite cumbersome and significant additional time and effort. We decided to look for another solution that would be easier to maintain in the long run.

**A balanced approach: `fallback` Mode and `GOVCS`**

This approach builds upon our aforementioned custom cache refresh which is specifically designed for the monorepo.

We came across the [GOVCS environment variable](https://go.dev/ref/mod#vcs-govcs), which we use in combination with the `fallback` network mode to effectively put only the monorepo in “offline” mode.

When `GOVCS` is set to `gitlab.company.com/monorepo/go:off`, Athens encounters an error whenever it tries to fetch modules from VCS:

```
gitlab.company.com/monorepo/go/commons/util/gk@v1.1.44: unrecognized import path "gitlab.company.com/monorepo/go/commons/util/gk": GOVCS disallows using git for private gitlab.company.com/monorepo/go; see 'go help vcs'
```

If Athens network mode is set to `strict`, Athens returns 404 errors to the user. By switching to `fallback` mode, Athens tries to retrieve the module from its storage if a `GOVCS` failure occurs.

Here’s the updated Athens configuration ([example default config](https://github.com/gomods/athens/blob/8e1581e10b0d3a70a30f45b10c24c3f992464d7a/config.dev.toml#L46)):

```
GoBinaryEnvVars = ["GOPROXY=direct", 
"GOPRIVATE=gitlab.company.com", 
"GOVCS=gitlab.company.com/monorepo/go:off"]

NetworkMode = "fallback"
```

With the custom cache refresh solution coupled with this approach, we not only accelerate the retrieval of Go modules within the monorepo but also allow for automatic updates for non-monorepo Go modules.

#### Final results

This solution resulted in a significant improvement in the performance of Go commands for our developers. With Athens, the same command is completed in just **~12 seconds (down from ~18 minutes)**, which is impressively fast.


<table class="table" border=1>
  <thead>
    <tr>
      <th>Go commands</th>
      <th>GOPROXY</th>
      <th>Previously cached?</th>
      <th>Description</th>
      <th>Result (time taken)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>go get -x gitlab.company.com/monorepo/go/commons/util/gk</code></td>
      <td>goproxy.company.com</td>
      <td>Yes</td>
      <td>Download and install the latest version of the module. This is a common scenario that developers often encounter.</td>
      <td>11.556 seconds</td>
    </tr>
    <tr>
      <td><code>go get -x gitlab.company.com/monorepo/go/commons/util/gk</code></td>
      <td>goproxy.company.com</td>
      <td>No</td>
      <td>Download and install the latest version of the module <strong>without any module cache</strong></td>
      <td>1:05.60 minutes</td>
    </tr>
    <tr>
      <td><code>go list -x -m -json -versions gitlab.company.com/monorepo/go/util/gk</code></td>
      <td>goproxy.company.com</td>
      <td>Yes</td>
      <td>List information about the monorepo module</td>
      <td>0.592 seconds</td>
    </tr>
    <tr>
      <td><code>go list -x -m -json -versions gitlab.company.com/monorepo/go/util/gk</code></td>
      <td>goproxy.company.com</td>
      <td>No</td>
      <td>List information about the monorepo module <strong>without any module cache</strong></td>
      <td>1.023 seconds</td>
    </tr>
  </tbody>
</table>

<table>
<tr>
<td>
<div class="post-image-section"><figure>
  <img src="img/go-module-proxy/image5.png" alt="" style="width:90%"><figcaption align="middle">Average cluster CPU utlisation</figcaption>
  </figure>
</div>
</td>
<td>
<div class="post-image-section"><figure>
  <img src="img/go-module-proxy/image3.png" alt="" style="width:90%"><figcaption align="middle">Average cluster memory utlisation</figcaption>
  </figure>
</div>
</td>
</tr>
</table>

In addition, this change to our Athens cluster also leads to substantial reduction in average cluster CPU and memory utilisation. This also enabled us to scale in and **scale down our entire Athens cluster by 70%**, resulting in cost savings and enhanced efficiency. On top of that, we were also able to effectively eliminate VCS's rate-limiting issues while making the monorepo's command operation considerably faster.

### 2. Go modules in GitLab subgroups

*Problem summary: Go modules are unable to work natively with private or internal repositories under GitLab subgroups.*

When it comes to managing code repositories and packages, [GitLab subgroups](https://docs.gitlab.com/ee/user/group/subgroups/) and Go modules have become an integral part of the development process at Grab. Go modules help to organise and manage dependencies, and GitLab subgroups provide an additional layer of structure to group related repositories together.

However, a common issue when using Go modules is that they **do not work natively** with private or internal repositories under a GitLab subgroup (see this [GitHub issue](https://github.com/golang/go/issues/29953)).

For example, using `go get` to retrieve a module from `gitlab.company.com/gitlab-org/subgroup/repo` will result in a failure. This problem is not specific to Go modules, all repositories under the subgroup will face the same issue.

#### A cumbersome workaround

To overcome this issue, we had to use workarounds. One workaround is to authenticate the HTTPS calls to GitLab by adding authentication details to the `.netrc` file on your machine.

The following lines can be added to the `.netrc` file:

```
machine gitlab.company.com
    login user@company.com
    password <personal-access-token>
```


In our case, we are using a Personal Access Token (PAT) since we have 2FA enabled. If 2FA is not enabled, the GitLab password can be used instead. However, this approach would mean configuring the `.netrc` file in the CI environments as well as on the machine of **every** Go developer.

#### Solution: Athens + `.netrc`

A feasible solution is to set up the `.netrc` file in the Go proxy server. This method eliminates the need for N number of developers to configure their own `.netrc` files. Instead, the responsibility for this task is delegated to the Go proxy server.

### 3. Sharing common libraries
*Problem summary: Distributing internal common libraries within a monorepo without granting direct repository access can be challenging.*

At Grab, we work with various cross-functional teams, and some could have distinct network access like different VPNs. This adds complexity to sharing our monorepo's internal common libraries with them. To maintain the security and integrity of our monorepo, we use a Go proxy for controlled access to necessary libraries.

The key difference between granting direct access to the monorepo via VCS and using a Go proxy is that the former allows users to read everything in the repository, while the latter enables us to grant access only to the specific libraries users need within the monorepo. This approach ensures secure and efficient collaboration across diverse network configurations.

#### Without Go module proxy

Without Athens, we would need to create a separate repository to store the code we want to share and then use a build system to automatically mirror the code from the monorepo to the public repository.

This process can be cumbersome and lead to inconsistencies in code versions between the two repositories, ultimately making it challenging to maintain the shared libraries.

Furthermore, copying code can lead to errors and increase the risk of security breaches by exposing confidential or sensitive information.

#### Solution: Athens + Download Mode File

To tackle this problem statement, we utilise Athens' [download mode file](https://docs.gomods.io/configuration/download/) feature using an allowlist approach to specify which repositories can be downloaded by users.

Here’s an example of the Athens download mode config file:

```
downloadURL = "https://proxy.golang.org"

mode = "sync"

download "gitlab.company.com/repo/a" {
    mode = "sync"
}

download "gitlab.company.com/repo/b" {
    mode = "sync"
}

download "gitlab.company.com/*" {
    mode = "none"
}
```

In the configuration file, we specify allowlist entries for each desired repo, including their respective download modes. For example, in the snippet above, `repo/a` and `repo/b` are allowed (`mode = “sync”`), while everything else is blocked using `mode = “none”`.

#### Final results

By using Athens' download mode feature in this case, the benefits are clear. Athens provides a secure, centralised place to store Go modules. This approach not only provides consistency but also improves maintainability, as all code versions are managed in one single location.

## Additional benefits of Go proxy

As we've touched upon the impressive results achieved by implementing Athens Go proxy at Grab, it's crucial to explore the supplementary advantages that accompany this powerful solution.

These unsung benefits, though possibly overlooked, play a vital role in enriching the overall developer experience at Grab and promoting more robust software development practices:

1.  **Module immutability**: ​​As the software world continues to face issues around changing or [disappearing libraries](https://qz.com/646467/how-one-programmer-broke-the-internet-by-deleting-a-tiny-piece-of-code), Athens serves as a useful tool in mitigating build disruptions by providing immutable storage for copied VCS code. The use of a Go proxy also ensures that builds remain deterministic, improving consistency across our software.
2.  **Uninterrupted development**: Athens allows users to fetch dependencies even when VCS is down, ensuring continuous and seamless development workflows.
3.  **Enhanced security**: Athens offers access control by enabling the blocking of specific packages within Grab. This added layer of security protects our work against potential risks from malicious third-party packages.
4.  **Vendor directory removal**: Athens prepares us for the eventual removal of the [vendor directory](https://docs.gomods.io/faq/#when-should-i-use-a-vendor-directory-and-when-should-i-use-athens), fostering faster workflows in the future.

## What’s next?

Since adopting Athens as a Go module proxy, we have observed considerable benefits, such as:

1.  Accelerated Go command operations
2.  Reduced infrastructure costs
3.  Mitigated VCS load issues

Moreover, its lesser-known advantages like module immutability, uninterrupted development, enhanced security, and vendor directory transition have also contributed to improved development practices and an enriched developer experience for Grab engineers.

Today, the straightforward process of exporting three environment variables has greatly influenced our developers' experience at Grab.

```
export GOPROXY="goproxy.company.com|proxy.golang.org,direct"

export GONOSUMDB="gitlab.company.com"

export GONOPROXY="none"
```

At Grab, we are always looking for ways to improve and optimise the way we work, so we contribute to open-sourced projects like Athens, where we help with bug fixes. If you are interested in setting up a Go module proxy, do give Athens ([github.com/gomods/athens](https://github.com/gomods/athens)) a try!

<small class="credits">Special thanks to Swaminathan Venkatraman, En Wei Soh, Anuj More, Darius Tan, and Fernando Christyanto for contributing to this project and this article.</small>

# Join us
Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
