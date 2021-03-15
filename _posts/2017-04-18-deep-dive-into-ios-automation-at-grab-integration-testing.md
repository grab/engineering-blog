---
layout: post
id: deep-dive-into-ios-automation-at-grab-integration-testing
title: Deep Dive into iOS Automation at Grab - Integration Testing
date: 2017-04-18 18:43:40
authors: [sun-xiangxin]
categories: [Engineering]
tags: [Continuous Integration, iOS, Mobile, Testing]
comments: true
excerpt: "This is the first part of our series \"Deep Dive Into iOS Automation At Grab\", where we will cover testing automation in the iOS team. Over the past two years at Grab, the iOS passenger app team has grown from 3 engineers in Singapore to 20 globally. Back then, each one of us was busy shipping features and had no time to set up a proper automation process."
---

This is the first part of our series "Deep Dive into iOS Automation at Grab", where we will cover testing automation in the iOS team. The second article is available [here](/deep-dive-into-ios-automation-at-grab-continuous-delivery).

Over the past two years at Grab, the iOS passenger app team has grown from 3 engineers in Singapore to 20 globally. Back then, each one of us was busy shipping features and had no time to set up a proper automation process. It was common to hear these frustrations from the team:

#### Travis Failed Again But it Passes in My Local

There was a time when iOS 9 came out and Travis failed for us for every single integration. We tried emailing their support but the communication took longer than we would have liked, and ultimately we didn't manage to fix the issue in time.

#### Fastlane Chose the Wrong Provisioning Profile Again

We relied on [Fastlane](https://fastlane.tools/) for quite some time and it is a brilliant tool. However, there was a time when some of us had issues with provisioning profiles constantly. Why and how we moved away from Fastlane will be explained later.

#### Argh, if More People Tested in Production Before the Release, This Crash Might have been Caught

Prior to the app release, we do regression testing in a production environment. In the past, this was done almost entirely by our awesome QA team via Testflight distributions exclusively. That meant it was hard to cover all combinations of OSes, device models, locations and passenger account settings. We had prior incidents that only happened to a particular phone model, operating system, etc. Those gave us motivation to install a company-wide dogfooding program.

If you can relate to any of the above. This article is for you. We set up and developed most of the stuff below in-house, hence if you don't have the time or manpower to maintain, it is still better to go with third-party services.

Testing and distribution are two aspects that we put a lot of effort in automating. Part I will cover how we do integration tests at Grab.

### Testing - Xcode Server

Besides being a complete Apple fan myself, there are a couple of other reasons why we chose Xcode Server over [Travis](https://travis-ci.org/) and [Bitrise](https://www.bitrise.io/) (which our Android team uses) to run our tests.

#### Faster Integration

Unlike most cloud services where every test is run in a random box from a macOS farm, at Grab, we have complete control of what machine we connect to. Provisioning a server (pretty much downloading Xcode, a macOS server, combined with some extremely simple steps) is a one-time affair and does not have to be repeated during each integration. e.g. Installing correct version of CocoaPods and command line libraries.

Instead of fresh cloning a repository, Xcode Server simply checks out the branch and pulls the latest code. That can save time especially when you have a long commit history.

#### Native Native Native

It is a lot more predictable. It guarantees that it's the same OS, same Xcode version, same Swift version. If the tests passes on your Xcode, and on your teammates' Xcodes, it will pass on the server's Xcode.

#### Perfect UI Testing Process Recording

This is the most important reason and is something Travis / Bitrise didn't offer at the time I was doing my research. When a UI test fails, knowing which line number caused it to fail is simply not enough. You would rather know what exactly happened. Xcode Server records every single step of your integration just like Xcode. You can easily skim through the whole process and view the screenshots at each stage. Xcode 8 even allows you to view a live screen on the Xcode Server while an integration is running.

For those of you who are familiar with UI testing on Xcode, you can view the results from the server in the exact same format. Clicking on the eye icon allows you to view the screenshots.

<div class="post-image-section">
  <img alt="Xcode UI Tests" src="/img/ios-automation/xcode-ui-tests.png">
</div>

Sounds good! Let's get started. On the day we got our server, we found creative ways to use it.

<div class="post-image-section">
  <img alt="Mac Pro" src="/img/ios-automation/mac-pro.jpg" width="60%">
  <small class="post-image-caption">Our multi-purpose server ♻️</small>
</div>

### Workflow

The basic idea is to create a bot when a feature branch is pushed, trigger the bot on each commit and delete the bot after the feature is merged / branch is deleted. Grab uses [Phabricator](https://www.phacility.com/phabricator/) as the main code review tool. We wrote scripts to create and delete the bots as [Arcanist](https://secure.phabricator.com/book/phabricator/article/arcanist/) post diff (branch is created/updated) and land (branch is merged) hooks.

<div class="post-image-section">
  <img alt="Surprised Koala" src="/img/ios-automation/surprised-koala.jpg" width="60%">
</div>

Some PHP is still required. This is all of it 😹:

~~~php
$botCommand = "ruby bot.rb trigger $remoteBranchName";
~~~

Creating a bot manually is simply a `POST` request to your server with the bot specifications in body and authentication in headers. You can totally use `cURL`. We wrote it in Ruby:

~~~ruby
response = RestClient::Request.execute(
  url: XCODE_SERVER_URL,
  method: 'post',
  verify_ssl: false,
  headers: @headers,
  payload: body
)

if response.code == 201
  puts "Successfully created bot #{name}, uuid #{uuid}"
  return JSON.parse(response.body)['_id']
else
  puts "Failed to create bot #{name}"
end
~~~

As you can see, `XCODE_SERVER_URL` is configurable. This is how we scale when the team expands.

Now the only thing left is to figure out the body payload. It is simple, all the bots and their configurations can be viewed as JSON via the following API. Simply create a bot via Xcode UI and it will reveal all the secrets:

~~~sh
curl -k -u username:password https://your.server.com:20343/api/bots
~~~

Apple doesn't have a lot of documentation on this. For a list of Xcode Server APIs you can try out [this list](http://docs.xcodeserverapidocs.apiary.io/#reference/bots/bots/create-a-new-bot).

### Gotchas

We have been happy with the server most of the time. However, along the way we did discover several downsides:

- The simulator that the Xcode Server spins up does not necessarily have customised location enabled. You probably want to mock your locations in code in testing environment.
- Installed builds are being updated during each integration and reused. There might be cache issues from previous integrations. Hence, deleting the app in your pre-integration script can be a good idea:

  ~~~sh
  $ xcrun simctl uninstall booted your.bundle.id
  ~~~
- Right after upgrading Xcode, you may face some transient issues. An example from what we've observed so far is that existing bots often can't find the simulators that used to be attached to them. Deleting old simulators and configuring new ones will help. That may also require you to change your bot creation script depending on your configuration. Restarting the server machine sometimes helps too.
- If you have one machine like us, there will be downtime during the software update. It either introduces inconvenience to your teammates or worse, someone could break master during the downtime.

Stay tuned for the second part where we will cover on how we manage continuous delivery.

*Many thanks to Dillion Tan and Tay Yang Shun who reviewed drafts and waited patiently for it to be published.*
