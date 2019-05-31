---
layout: post
id: react-native-in-grabpay
title: React Native in GrabPay
date: 2019-05-30 17:00:00
authors: [sushant-tiwari, vinod-prajapati]
categories: [Engineering]
tags: [Grab, Mobile, GrabPay, React]
comments: true
cover_photo: /img/react-native-in-grabpay/cover.png
excerpt: "This blog post describes how we used React Native to optimize the Grab PAX app."
---
# Overview

It wasn’t too long ago that Grab formed a new team, GrabPay, to improve the cashless experience in Southeast Asia and to venture into the promising mobile payments arena. To support the work, Grab also decided to open a new R&D center in Bangalore.

It was an exciting journey for the team from the very beginning, as it gave us the opportunity to experiment with new cutting edge technologies. Our first release was the [GrabPay Merchant App](https://itunes.apple.com/sg/app/grabpay-merchant/id1343620481?mt%3D8&sa=D&ust=1559291325740000), the first all React Native Grab App. Its success gave us the confidence to use React Native to optimize the Grab PAX app.

React Native is an open source mobile application framework. It lets developers use React (a JavaScript library for building user interfaces) with native platform capabilities. Its two big advantages are:

*   We could make cross-platform mobile apps and components completely in JavaScript.
*   Its [hot reloading](http://facebook.github.io/react-native/blog/2016/03/24/introducing-hot-reloading&sa=D&ust=1559291325740000) feature significantly reduced development time.

This post describes our work on developing React Native components for Grab apps, the challenges faced during implementation, what we learned from other internal React Native projects, and our future roadmap.

Before embarking on our work with React Native, these were the goals we set out. We wanted to:

*   Have a reusable code between Android and iOS as well as across various Grab apps (Driver app, Merchant app, etc.).
*   Have a single codebase to minimize the effort needed to modify and maintain our code long term.
*   Match the performance and standards of existing Grab apps.
*   Use as few Engineering resources as possible.

# Challenges

Many Grab teams located across Southeast Asia and in the United States support the App platform. It was hard to convince all of them to add React Native as a project dependency and write new feature code with React Native. In particular, having React Native dependency significantly increases a project’s binary’s size,

But the initial cost was worth it. We now have only a few modules, all written in React Native:

*   Express
*   Transaction History
*   Postpaid Billpay

As there is only one codebase instead of two, the modules take half the maintenance resources. Debugging is faster with React Native’s hot reloading. And it’s much easier and faster to implement one of our modules in another app, such as DAX.

Another challenge was creating a universally acceptable format for a bridging library to communicate between existing code and React Native modules. We had to define fixed guidelines to create new bridges and define communication protocols between React Native modules and existing code.

Invoking a module written in React Native from a Native Module (written in a standard computer language such as Swift or Kotlin) should follow certain guidelines. Once all Grab’s tech families reached consensus on solutions to these problems, we started making our bridges and doing the groundwork to use React Native.

# Foundation

On the native side, we used the Grablet architecture to add our React Native modules. Grablet gave us a wonderful opportunity to scale our Grab platform so it could be used by any tech family to plug and play their module. And the module could be in any of  Native, React Native, Flutter, or Web.

We also created a framework encapsulating all the project’s React Native Binaries. This simplified the React Native Upgrade process. Dependencies for the framework are [react](https://www.npmjs.com/package/react&sa=D&ust=1559291325745000), [react-native](https://www.npmjs.com/package/react-native&sa=D&ust=1559291325745000), and [react-native-event-bridge](https://www.npmjs.com/package/react-native-event-bridge&sa=D&ust=1559291325746000).

We had some internal proof of concept projects for determining React Native’s performance on different devices, as discussed here. Many teams helped us make an extensive set of JS bridges for React Native in Android and iOS. Oleksandr Prokofiev wrote this bridge creation example:

```
publicfinalclassDeviceKitModule: NSObject, RCTBridgeModule {
 privateletdeviceKit: DeviceKitService

 publicinit(deviceKit: DeviceKitService) {
   self.deviceKit = deviceKit
   super.init()
 }
 publicstaticfuncmoduleName() -> String {
   return"DeviceKitModule"
 }
 publicfuncmethodsToExport() -> \[RCTBridgeMethod\] {
   let methods: \[RCTBridgeMethod?\] = \[
     buildGetDeviceID()
     \]
   return methods.compactMap { $0 }
 }

 privatefuncbuildGetDeviceID() -> BridgeMethodWrapper? {
   returnBridgeMethodWrapper("getDeviceID", { \[weakself\] (\_: \[Any\], \_, resolve) in
     letvalue = self?.deviceKit.getDeviceID()
     resolve(value)
   })
 }
}
```

## GrabPay Components and React Native

The GrabPay Merchant App gave us a good foundation for React Native in terms of

*   Component libraries
*   Networking layer and api middleware
*   Real world data for internal assessment of performance and stability

We used this knowledge to build theTransaction History and GrabPay Digital Marketplace components inside the Grab Pax App with React Native.

### Component Library

We selected particularly useful components from the Merchant App codebase such as `GPText`, `GPTextInput`, `GPErrorView`, and `GPActivityIndicator`. We expanded that selection to a common (internal) component library of approximately 20 stateless and stateful components.

### API Calls

We used to make api calls using [axios](https://github.com/axios/axios&sa=D&ust=1559291325755000) (now deprecated). We now make calls from the Native side using bridges that return a promise and make api calls using an existing framework. This helped us remove the dependency for getting an access token from  Native-Android or Native-iOS to make the calls. Also it helped us optimize the api requests, as suggested by [Parashuram](https://hasgeek.com/reactfoo/2019/proposals/building-react-native-8TGxsthFUN4CJi2B82zDxd&sa=D&ust=1559291325756000) from Facebook’s React Native team.

### Locale

We use [React Localize Redux](https://www.npmjs.com/package/react-localize-redux&sa=D&ust=1559291325756000) for all our translations and [moment](https://www.npmjs.com/package/moment&sa=D&ust=1559291325757000) for our date time conversion as per the device’s current Locale. We currently support translation in five languages; English, Chinese Simplified, Bahasa Indonesia, Malay, and Vietnamese. This Swift code shows how we get the device’s current Locale from the native-react Native Bridge.

```
publicfuncmethodsToExport() -> \[RCTBridgeMethod\] {
   let methods: \[RCTBridgeMethod?\] =  \[
     BridgeMethodWrapper("getLocaleIdentifier", { (\_, \_, resolver) in
     letlocaleIdentifier = self.locale.getLocaleIdentifier()
     resolver(localeIdentifier)
   })\]
   return methods.compactMap { $0 }
 }
```

### Redux

Redux is an extremely lightweight predictable state container that behaves consistently in every environment. We use Redux with React Native to manage its state.

### Navigation

For in-app navigation we use [react-navigation](https://reactnavigation.org/docs/en/getting-started.html&sa=D&ust=1559291325760000). It is very flexible in adapting to both the Android and iOS navigation and gesture recognition styles.

# End Product

After setting up our foundation bridges and porting skeleton boilerplate code from the GrabPay Merchant App, we wrote two payments modules using GrabPay Digital Marketplace (also known as BillPay), React Native, and Transaction History.

<div class="post-image-section">
  <img alt="Grab app - Selecting a company" src="/img/react-native-in-grabpay/image4.jpg">
</div>


The ios Version is on the left and the Android version is on the right. Not only do their UIs look identical, but also their code is identical. A single codebase lets us debug faster, deliver quicker, and maintain smaller (codebase; apologies but it was necessary for the joke).

<div class="post-image-section">
  <img alt="Grab app - Company selected" src="/img/react-native-in-grabpay/image6.jpg">
</div>

We launched BillPay first in Indonesia, then in Vietnam and Malaysia. So far, it’s been a very stable product with little to no downtime.

Transaction History started in Singapore and is now rolling out in other countries.

# Flow For BillPay

<div class="post-image-section">
  <img alt="BillPay Flow" src="/img/react-native-in-grabpay/image3.jpg">
</div>

The above shows BillPay’s flow.

1.  We start with the first screen, called Biller List. It shows all the postpaid billers available for the current region. For now, we show Billers based on which country the user is in. The user selects a biller.
2.  We then asks for your `customerID` (or prefills that value if you have paid your bill before). The amount is either fetched from the backend or filled in by the user, depending on the region and biller type.
3.  Next, the user confirms all the entered details before they pay the dues.
4.  Finally, the user sees their bill payment receipt. It comes directly from the biller, and so it’s a valid proof of payment.

Our React Native version has kept the same experience as our Native developed App and help users pay their bills seamlessly and hassle free.

# Future


We are moving code to Typescript to reduce compile-time bugs and clean up our code. In addition to reducing native dependencies, we will refactor modules as needed. We will also have 100% unit test code coverage. But most importantly, we plan to open source our component library as soon as we feel it is stable.
