---
layout: post
id: 2020-06-29-how-we-built-our-in-house-chat-platform-for-the-web
title: How we built our in-house chat platform for the web
date: 2020-06-29 14:34:40
authors: [vasudevan-k]
categories: [Engineering]
tags: [Chat, Web, Customer Support, Engineering]
comments: true
cover_photo: /img/how-we-built-our-in-house-chat-platform-for-the-web/cover.png
excerpt: "This blog post shares our learnings from building our very own chat platform for the web."
---

At Grab, we've built an in-house chat platform to help connect our passengers with drivers during a booking, as well as with their friends and family for social sharing purposes.

<div class="post-image-section"><figure>
  <img src="/img/how-we-built-our-in-house-chat-platform-for-the-web/image6.png" alt="P2P chat for the Angbow campaign and GrabHitch chat">
  <figcaption align="middle"><i>P2P chat for the Angbow campaign and GrabHitch chat</i></figcaption>
</figure></div>

We wanted to focus on our customer support chat experience, and so we replaced the third-party live chat tool that we've used for years with our newly developed chat platform. As a part of this initiative, we extended this platform for the web to integrate with our internal Customer Support portal.

<div class="post-image-section"><figure>
  <img src="/img/how-we-built-our-in-house-chat-platform-for-the-web/image3.png" alt="Sample chat between a driver and a customer support agent">
  <figcaption align="middle"><i>Sample chat between a driver and a customer support agent</i></figcaption>
</figure></div>

This is the first time we introduced chat on the web, and we faced a few challenges while building it. In this article, we’ll go over some of these challenges and how we solved them.

## Current Architecture

A vast majority of the communication from our Grab Passenger and Driver apps happens via TCP. Our TCP gateway takes care of processing all the incoming messages, authenticating, and routing them to the respective services. Our TCP connections are unicast, which means there is only one active connection possible per user at any point in time. This served us well, as we only allow our users to log in from one device at a time.

<div class="post-image-section"><figure>
  <img src="/img/how-we-built-our-in-house-chat-platform-for-the-web/image2.png" alt="A TL;DR version of our current system">
  <figcaption align="middle"><i>A TL;DR version of our current system</i></figcaption>
</figure></div>

However, this model breaks on the web since our users can have multiple tabs open at the same time, and each would establish a new socket connection. Due to the unicast nature of our TCP connections, the older tabs would get disconnected and wouldn’t receive any messages from our servers. Our Customer Support agents love their tabs and have a gazillion open at any time. This behaviour would be too disruptive for them.

The obvious answer was to change our TCP connection strategy to multicast. We took a look at this and quickly realised that it was going to be a huge undertaking and could introduce a lot of unknowns for us to deal with.

We had to consider a different approach for the web and zeroed in on a hybrid approach with a little known Javascript APIs called [SharedWorker](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker) and [BroadcastChannel](https://developers.google.com/web/updates/2016/09/broadcastchannel).

## Understanding the basics

Before we jump in, let's take a quick detour to review some of the terminologies that we'll be using in this post.

If you're familiar with how WebWorker works, feel free to skip ahead to the next section. For the uninitiated, JavaScript on the browser runs in a single-threaded environment. Workers are a mechanism to introduce background, OS-level threads in the browser. Creating a worker in JavaScript is simple. Let’s look at it with an example:

```js
//instantiate a worker
const worker = new WebWorker("./worker.js");
worker.postMessage({ message: "Ping" });
worker.onMessage((e) => {
  console.log("Message from the worker");
});

// and in  worker.js
onMessage = (e) => {
  console.log(e.message);
  this.postMessage({ message: "pong" });
};
```

The worker API comes with a handy `postMessage` method which can be used to pass messages between the main thread and worker thread. Workers are a great way to add concurrency in a JavaScript application and help in speeding up an expensive process in the background.

Note: While the method looks similar, [`worker.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/postMessage) is not the same as [`window.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage).

### What is a SharedWorker?

SharedWorker is similar to a WebWorker and spawns an OS thread, but as the name indicates, it's shared across browser contexts. In other words, there is only one instance of that worker running for that domain across tabs/windows. The API is similar to WebWorker but has a few subtle differences.

SharedWorkers internally use [MessagePort](https://developer.mozilla.org/en-US/docs/Web/API/MessagePort) to pass messages between the worker thread and the main thread. There are two ports- one for sending a message to the main thread and the other to receive. Let's explore it with an example:

```js
const mySharedWorker = new SharedWorker("./worker.js");
mySharedWorker.port.start();
mySharedWorker.port.postMessage(message);

onconnect = (e) => {
  const port = e.ports[0];

  // Handle messages from the main thread
  port.onmessage = handleEventFromMainThread.bind(port);
};

// Message from the main thread
const handleEventFromMainThread = (params) => {
  console.log("I received", params, "from the main thread");
};

const sendEventToMainThread = (params) => {
  connections.forEach((c) => c.postMessage(params));
};
```

There is a lot to unpack here. Once a SharedWorker is created, we've to manually start the port using `mySharedWorker.port.start()` to establish a connection between the script running on the main thread and the worker thread. Post that, messages can be passed via the worker’s `postMessage` method. On the worker side, there is an `onconnect` callback which helps in setting up listeners for connections from each browser context.

Under the hood, SharedWorker spawns a single OS thread per worker script per domain. For instance, if the script name is `worker.js` running in the domain `https://ce.grab.com`. The logic inside `worker.js` runs _exactly once_ in this domain. The advantage of this approach is that we can run multiple worker scripts in the same-origin each managing a different part of the functionality. This was one of the key reasons why we picked SharedWorker over other solutions.

### What are Broadcast channels

In a multi-tab environment, our users may send messages from any of the tabs and switch to another for the next message. For a seamless experience, we need to ensure that the state is in sync across all the browser contexts.

<div class="post-image-section"><figure>
  <img src="/img/how-we-built-our-in-house-chat-platform-for-the-web/image1.png" alt="Message passing across tabs">
  <figcaption align="middle"><i>Message passing across tabs</i></figcaption>
</figure></div>

The `BroadcastChannel` API creates a message bus that allows us to pass messages between multiple browser contexts within the same origin. This helps us sync the message that's being sent on the client to all the open tabs.

Let’s explore the API with a code example:

```js
const channel = new BroadcastChannel("chat_messages");
// Sets up an event listener to receive messages from other browser contexts
channel.onmessage = ({ data }) => {
  console.log("Received ", data);
};

const sendMessage = (message) => {
  const event = { message, type: "new_message" };
  send(event);
  // Publish event to all browser contexts listening on the chat\_messages channel
  channel.postMessage(event);
};

const off = () => {
  // clear event listeners
  channel.close();
};
```

One thing to note here is that communication is restricted to listeners from the same origin.

## How are our chat rooms powered

Now that we have a basic understanding of how SharedWorker and Broadcast channels work, let's take a peek into how Grab is using it.

Our Chat SDK abstracts the calls to the worker and the underlying transport mechanism. On the surface, the interface just exposes two methods: one for sending a message and another for listening to incoming events from the server.

```js
export interface IChatSDK {
  sendMessage: (message: ChatMessage) => string;
  sendReadReceipt: (receiptAck: MessageReceiptACK) => void;
  on: (callback: ICallBack) => void;
  off: (topic?: SDKTopics) => void;
  close: () => void;
}
```

The SDK does all the heavy lifting to manage the connection with our TCP service, and keeping the information in-sync across tabs.

<div class="post-image-section"><figure>
  <img src="/img/how-we-built-our-in-house-chat-platform-for-the-web/image5.png" alt="SDK flow">
  <figcaption align="middle"><i>SDK flow</i></figcaption>
</figure></div>

In our worker, we additionally maintain all the connections from browser contexts. When an incoming event arrives from the socket, we publish it to the first active connection. Our SDK listens to this event, processes it, sends out an acknowledgment to the server, and publishes it in the BroadcastChannel. Let’s look at how we’ve achieved this via a code example.

Managing connections in the worker:

```js
let socket;
let instances = 0;
let connections = [];

let URI: string;

// Called when a  new worker is connected.
// Worker is created at
onconnect = e => {
 const port = e.ports[0];

 port.start();
 port.onmessage = handleEventFromMainThread.bind(port);
 connections.push(port);
 instances ++;
};

// Publish ONLY to the first connection.
// Let the caller decide on how to sync this with other tabs
const callback= (topic, payload) => {
    connections[0].postMessage({
      topic,
      payload,
    });
 }

 const handleEventFromMainThread = e => {
   switch (e.data.topic) {
     case SocketTopics.CONNECT: {
       const config = e.data.payload;
       if (!socket) {
         // Establishes a WebSocket connection with the server
          socket = new SocketManager({...})
        } else {
          callback(SocketTopics.CONNECTED, '');
        }
        break;
      }
      case SocketTopics.CLOSE: {
        const index = connections.indexOf(this);
        if (index != -1 && instances > 0) {
            connections.splice(index, 1);
            instances--;
        }
        break;
      }
        // Forward everything else to the server
      default: {
        const payload = e.data;
        socket.sendMessage(payload);
        break;
      }
    }
  }
```

And in the ChatSDK:

```js
// Implements IChatSDK

// Rough outline of our GrabChat implementation

class GrabChatSDK {
  constructor(config) {
    this.channel = new BroadcastChannel('incoming_events');
    this.channel.onmessage = ({data}) => {
        switch(data.type) {
            // Handle events from other tabs
            // .....
        }
    }
    this.worker = new SharedWorker('./worker', {
        type: 'module',
        name: `${config.appID}-${config.appEnv}`,
        credentials: 'include',
      });
      this.worker.port.start();
      // Publish a connected event, so the worker manager can register this connection
      this.worker.port.postMessage({
        topic: SocketTopics.CONNECT,
        payload,
      });
      // Incoming event from the shared worker
      this.worker.port.onmessage = this._handleIncomingMessage;
      // Disconnect this port before tab closes
      addEventListener('beforeunload', this._disconnect);
    }

    sendMessage(message) {
      // Attempt a delivery of the message
      worker.postMessage({
        topic: SocketTopics.NEW_MESSAGE,
        getPayload(message),
      });
      // Send the message to all tabs to keep things in sync
      this.channel.postMessage(getPayload(message));
    }

    // Hit if this connection is the leader of the SharedWorker connection
    _handleIncomingMessage(event) {
      // Send an ACK to our servers confirming receipt of the message
      worker.postMessage({
        topic: SocketTopics.ACK,
        payload,
      });

      if (shouldBroadcast(event.type)) {
        this.channel.postMessage(event);
      }

      this.callback(event);
    }

    _disconnect() {
      this.worker.port.postMessage(data);
      removeEventListener('beforeunload', this._disconnect);
    }
}
```

This ensures that there is only one connection between our application and the TCP service irrespective of the number of tabs the page is open in.

## Some caveats

While SharedWorker is a great way to enforce singleton objects across browser contexts, the developer experience of SharedWorker leaves a lot to be desired. There aren't many resources on the web, and it could be quite confusing if this is the first time you're using this feature.

We faced some trouble integrating SharedWorker with bundling the worker code along. This plugin from [GoogleChromeLabs](https://github.com/GoogleChromeLabs/worker-plugin) did a great job of alleviating some pain. Debugging an issue with SharedWorker was not obvious. Chrome has a dedicated page for inspecting SharedWorkers (`chrome://inspect/#workers`), and it took some getting used to.

The browser support for SharedWorker is [far from universal](https://caniuse.com/sharedworkers). While it works great in Chrome, Firefox, and Opera, Safari and most mobile browsers lack support. This was an acceptable trade-off in our use case, as we built this for an internal portal and all our users are on Chrome.

<div class="post-image-section"><figure>
  <img src="/img/how-we-built-our-in-house-chat-platform-for-the-web/image4.png" alt="Shared race">
  <figcaption align="middle"><i>Shared race</i></figcaption>
</figure></div>

SharedWorker enforces uniqueness using a combination of origin and the script name. This could potentially introduce an unintentional race condition during deploy times if we’re not careful. Let’s say the user has a tab open before the latest deployment, and another one after deployment, it’s possible to end up with two different versions of the same script. We built a wrapper over the SharedWorker which cedes control to the latest connection, ensuring that there is only one version of the worker active.

## Wrapping up

We’re happy to have shared our learnings from building our in-house chat platform for the web, and we hope you found this post helpful. We’ve built the web solution as a reusable SDK for our internal portals and public-facing websites for quick and easy integration, providing a powerful user experience.

We hope this post also helped you get a deeper sense of how SharedWorker and BroadcastChannels work in a production application.


---

<small class="credits">Authored By Vasu on behalf of the Real-Time Communications team at Grab. Special thanks to the working team for their contributions- Sanket Thanvi, Dinh Duong, Kevin Lee, and Matthew Yeow.</small>

---

## Join us

Grab is more than just the leading ride-hailing and mobile payments platform in Southeast Asia. We use data and technology to improve everything from transportation to payments and financial services across a region of more than 620 million people. We aspire to unlock the true potential of Southeast Asia and look for like-minded individuals to join us on this ride.

If you share our vision of driving South East Asia forward, [apply](https://grab.careers/jobs/) to join our team today.
