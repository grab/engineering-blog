---
layout: post
id: 2024-09-17-live-activity-2
title: 'Bringing Grab’s Live Activity to Android: Enhancing User Experience Through Custom Notifications'
date: 2024-09-23 00:00:10
authors: [jessica-sean]
categories: [Engineering]
tags: [Engineering, Android, Exploration]
comments: true
cover_photo: /img/live-activity/live-activity-banner.jpg
excerpt: "Unleashing Live Activity feature for iOS. TLive Activity is a feature that enhances user experience by displaying a user interface (UI) outside of the app, delivering real-time updates and interactive content. Discover how its was solutionised at Grab."
---

In May 2023, Grab unveiled the Live Activity feature for iOS, which received positive feedback from users. Live Activity is a feature that enhances user experience by displaying a user interface (UI) outside of the app, delivering real-time updates and interactive content. At Grab, we leverage this feature to keep users informed about their order updates without requiring them to manually open the app.

While Live Activity is a native iOS feature provided by Apple, there is currently no official Android equivalent. However, we are determined to bring this immersive experience to Android users. Inspired by the success of Live Activity on iOS, we have embarked on design explorations and feasibility studies to ensure the seamless integration of Live Activity into the Android platform. Our ultimate goal is to provide Android users with the same level of convenience and real-time updates, elevating their Grab experience.

## Product Exploration

In July 2023, we took a proactive step by forming a dedicated working group with the specific goal of exploring Live Activity on the Android platform. Our mindset was focused on quickly enabling the MVP (Minimum Viable Product) of this feature for Android users. We focused on enabling Grab users to track food and mart orders on Live Activity as our first use-case. We also designed the Live Activity module as an extendable platform, allowing easy adoption by other Grab internal verticals such as the Express and Transport teams. 

The team kicked off by analysing the current solution and end-to-end flow of Live Activity on iOS. The objective was to uncover opportunities on how we could leverage the existing platform approach.

<div class="post-image-section"><figure>
  <img src="/img//live-activity-2/figure1.png" alt="" style="width:30%"><figcaption align="middle">Figure 1. Grab iOS Live Activity flow.</figcaption>
  </figure>
</div> 
 

The first thing that caught our attention was that there is no Live Activity Token (also known as Push Token) concept on Android. Push Token is a token generated from the ActivityKit framework and used to remotely start, update, and end Live Activity notifications on iOS.

Our goal was to match the Live Activity set-up of iOS in Android, which was a challenge due to the missing Push Token. This required us to think outside the box and develop an innovative workaround. After multiple brainstorming sessions, the team developed two potential solutions, Solution 1 and Solution 2, as illustrated below:

<div class="post-image-section"><figure>
  <img src="/img//live-activity-2/figure2.png" alt="" style="width:80%"><figcaption align="middle">Figure 2. Proposed solutions for Live Activity for Android.</figcaption>
  </figure>
</div> 


We evaluated the two solutions. The first solution is to substitute the Push Token with a placeholder value, serving as a distinctive notification identifier. Whereas, the second solution involves the Hedwig service, our in-house message delivery service. We proposed to bypass the Live Activity token check process specifically for Android devices. Following extensive discussions, we decided to proceed with the first solution, which ensures consistency in the technical approach between Android and iOS platforms. Additionally, this solution allows us to ensure that notifications are only pushed to the devices that support the Live Activity feature. This decision strikes a good balance between efficiency and compatibility.

### UI Components

Starting with a kick-off project meeting where we showcased our plans and proposed solutions to our stakeholders, the engineering team presented two native Android UI components that could be utilised to replicate Live Activity: the Notification View and the Floating View. 

**The Notification View** is a component located in the notification drawer (and potentially on the Lock Screen) that fulfils the most basic use-case of the Live Activity feature. It enables Android users to access information without the need to open the app. Since the standard notification template only allows developers to display a single content title, a content subtitle, and one image, it falls short of meeting our Live Activity UI requirements. To overcome this limitation, custom notifications with custom layouts are needed.

<div class="post-image-section"><figure>
  <img src="/img//live-activity-2/figure3.gif" alt="" style="width:40%"><figcaption align="middle">Figure 3. Early design spec of Grab’s LA using custom notification.</figcaption>
  </figure>
</div>  

One of the key advantages of custom notifications is that they do not require any additional new permissions, ensuring a smooth user experience. Additionally, Android users are accustomed to checking their notifications from the notification tray, making it a familiar and intuitive interaction. However, it is important to acknowledge that custom notifications rely on a remote view, which can pose restrictions on rendering only specific views. On top of that, custom notifications provide a limited space for content – limited to 48dp when collapsed and 252dp when expanded.

**The Floating View** is a component that will appear above all the applications in Android. It adds the convenience of accessing the information when the device is unlocked or when the user is on another app.   

<div class="post-image-section"><figure>
  <img src="/img//live-activity-2/figure4.png" alt="" style="width:80%"><figcaption align="middle">Figure 4. Early design spec of Grab’s LA using floating view.</figcaption>
  </figure>
</div>  

The use of a Floating View offers greater flexibility to the view by eliminating the reliance on a remote view. However, it’s important to be aware of the potential limitations associated with this approach. These limitations include the requirement for screen space, which can potentially impact other app functionalities and cause frustration for users. Additionally, if we intend to display multiple order updates, we may require even more space, taking into account that Grab allows users to place multiple orders. Furthermore, the Floating View feature requires an extra "Draw over other apps" permission, a setting that allows an app to display information on top of other apps on your screen.

After thoughtful deliberation, we concluded that custom notifications provide a more consistent and user-friendly solution for implementing Grab's Live Activity feature on Android. They offer compatibility, non-intrusiveness, no extra permissions, and the flexibility of silent notifications, ensuring an optimised user experience.

## Building Grab Android’s “Live Activity”

We began developing the Live Activity feature by focusing on Food and Mart for the MVP. However, we prioritised potential future use cases for other verticals by examining the existing functionality of the Grab iOS Live Activity feature. By considering these factors from the start, we need to make sure that we build an extendable and flexible solution that caters to different verticals and their various use-cases.

<div class="post-image-section"><figure>
  <img src="/img//live-activity-2/figure5.gif" alt="" style="width:40%"><figcaption align="middle">Figure 5. Grab’s Android Live Activity.</figcaption>
  </figure>
</div>  

As we set out to design Grab's Android Live Activity module, we broke down the task into three key components:

1. **Registering Live Activity Token**

In order to enable Hedwig services to send Live Activity notifications to devices, it is necessary to register a Live Activity Token for a specific order to Grab Devices services (refer to figure 1 for the iOS flow). As this use-case is applicable across various verticals in iOS, we have designed a LiveActivityIntegrationManager class specifically to handle this functionality.

```
interface LiveActivityIntegrationManager {  
    /\*\*  
     \* To start live activity journey  
     \* @param vertical refers to vertical name  
     \* @param id refers to unique id which is used to differentiate live activity UI instances  
     \* eg: Food will use orderID as id, transport can pass rideID  
     \*\*/  
    fun startLiveActivity(vertical: Vertical, id: String): Completable

    fun updateLiveActivity(id: String, attributes: LiveActivityAttributes)

    fun cancelLiveActivity(id: String)  
}  

``` 

Our goal is to provide developers with an easy implementation of Live Activity in the Grab app. Developers can simply utilize the startLiveActivity() function to register the token to Grab Devices by passing the vertical name and unique ID as parameters. 

2. **Notification Listener and Payload Mapping**

To handle Live Activity notifications in Android, it is necessary to listen to the Live Activity notification payload and map it to `LiveActivityAttributes`. Taking into consideration the initial Live Activity design (refer to figure 3), we need to analyse the variables necessary for this process. As a result, we break down the Live Activity UI into different UI elements and layouts, as follows:

<div class="post-image-section"><figure>
  <img src="/img//live-activity-2/figure6.png" alt="" style="width:50%"><figcaption align="middle">Figure 6. Android Live Activity view breakdown.</figcaption>
  </figure>
</div>


1. **App Icon** – labeled as 1 in Figure 6.   
   This view always shows the Grab app icon.  
2. **Header Icon** – labeled as 2 in Figure 6.  
   This view is an image view that could be set with icon resources.  
3. **Content Title View** – labeled as 3 in Figure 6.   
   This view is a placeholder that could be set with a text or custom remote view.  
4. **Content Text View** – labeled as 4 in Figure 6.   
   This view is a placeholder that could be set with a text or custom remote view.  
5. **Footer View** – labeled as 5 in Figure 6.  
   This view is a placeholder that could be set with icon resources, bitmap, or custom remote view.

Decomposing the UI into different parts allows us to clearly understand of the UI components that need to maintain consistency across different use-cases, as well as the elements that can be easily customised and configured based on specific requirements. As a result, we have designed the `LiveActivityAttributes` class that serves as a container that encompasses all the necessary configurations required for rendering the Live Activity.

```
 
class LiveActivityAttributes private constructor(  
    val iconRes: Int?,  
    val headerIconRes: Int?,  
    val contentTitle: CharSequence?,  
    val contentTitleStyle: ContentStyle.TitleStyle?,  
    val customContentTitleView: LiveActivityCustomView?,  
    val contentText: CharSequence?,  
    val contentTextStyle: ContentStyle.TextStyle?,  
    val customContentTextView: LiveActivityCustomView?,  
    val footerIconRes: Int?,  
    val footerBitmap: Bitmap?,  
    val footerProgressBarProgress: Float?,  
    val footerProgressBarStyle: ProgressBarStyle?,  
    val footerRatingBarAttributes: RatingBarAttributes?,  
    val customFooterView: LiveActivityCustomView?,  
    val contentIntent: PendingIntent?,  
    …  
)  

```

3. **Payload Rendering**

To ensure a clear separation of responsibilities, we have designed a separate class called `LiveActivityManager`. This dedicated class is responsible for the mapping of `LiveActivityAttributes` to Notifications. The generated notifications are then utilised by Android's `NotificationManager` class to be posted and displayed accordingly.

```

interface LiveActivityManager {  
    /\*\*  
     \* Post a Live Activity to be shown in the status bar, stream, etc.  
     \*  
     \* @param id           the ID of the Live Activity  
     \* @param attributes the LiveActivity to post to the system  
     \*/  
    fun notify(id: Int, attributes: LiveActivityAttributes)

    fun cancel(id: Int)  
}

```

## What’s Next?

We are delighted to announce that we have successfully implemented Grab’s Android version of the Live Activity feature for Express and Transport products. Furthermore, we plan to extend this feature to the Driver and Merchant applications as well. We understand the value this feature brings to our users and are committed to enhancing it further. Stay tuned for upcoming updates and enhancements to the Live Activity feature as we continue to improve and expand its capabilities across various verticals.

# Join us
Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.
 
Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!

