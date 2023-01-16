---
layout: post
id: programmers-beware-ux-is-not-just-for-designers
title: Programmers Beware - UX is Not Just for Designers
date: 2016-07-05 08:23:00
authors: [corey-scott]
categories: [Engineering]
tags: [API, UX]
comments: true
excerpt: "Perhaps one of the biggest missed opportunities in Tech in recent history is UX.

Somehow, UX became the domain of Product Designers and User Interface Designers.

While they definitely are the right people to be thinking about web pages, mobile app screens and so on, we've missed a huge part of what we engineers work on every day: SDKs and APIs."
---
Perhaps one of the biggest missed opportunities in Tech in recent history is UX.

Somehow, UX became the domain of Product Designers and User Interface Designers.

While they definitely are the right people to be thinking about web pages, mobile app screens and so on, we've missed a huge part of what we engineers work on every day: SDKs and APIs.

We live in a time where "the API economy" exists and has tangible monetary and strategic value and yet, UX is seldom considered.
Additionally, consider how many functions a programmer interacts with every day and yet how little (read: almost none) time is spent on the UX of these functions.

### What is UX?

First let me give you my perspective on UX. UX stands for "User Experience" or to put it another way, "usability".

UX is not black art; you don't even need to study it. I believe it can be uncovered through logic, persistence and experience.

I believe good UX can be discovered using the following "UX Discovery Survey".

Ask yourself (or your team) these 5 quick questions and you will be well on your way to create better UX.

- **Who/What is the user?** - Yes, users can be other systems and not just people.
- **What do they want to achieve?** - Often the answer to this is a list of things, this is fine. However, it's generally possible to apply the 80/20 rule; meaning users will want to do 1 thing 80% of the time and the rest about 20%. We should always over-optimise for the 80%; even if it means making the 20% a lot more complicated or inconvenient.
- **What are they capable of?** - What skills do they have? What domain knowledge do they have? What kind of experience? When designing systems for others there is often a huge difference between these factors for the user and the creator. This factor shows up a lot more when the answer to "Who/What is the user" is a human and not a system.
- **What can I do to make their life easier?** – This is really the driving force behind UX, focus on the user and how to please them.
Is there anything similar out there that the user already knows how to use? – The best interfaces are often ubiquitous or intuitive.  The focus here is on modelling the interface to do what the user expects it to do, without prior training or experience with it. If you ever have access to the end user, try asking them these questions:

  >"What do you think it should do?"
  >
  >"What did you expect to happen when you did X?"

Let me show you what I mean with some examples of Engineering UX:

#### A REST API Called from a Mobile Application

When the app in question starts, it must make a call to the server to login and use the returned credentials to make another to download the latest news.

<u>What's wrong with this?</u>

This makes 2 round trips to the server, which results in:

- 2 potential points of failure
- Double the network latency
- Additional code complexity of handling the additional points of failure
- Additional code complexity of handling the "session" between calls

<u>Finding a Better UX</u>

Let's run through the "UX Discovery Survey":

- **Who/What is the user?** - The user here is not the programmer using the API but the mobile application.
- **What do they want to achieve?** - They want to load the data from the server in the fastest possible manner using the least amount of battery and data as possible.
- **What are they capable of?** - It's app. It's capable of whatever the app programmer is capable of.
- **What can I do to make their life easier?** - One call is always going to be easier to code than two.  One point of failure is always easier to handle than two.
- **Is there anything similar out there that the user already knows how to use?** - Not applicable here.

Merge the requests together and have the app send either the login credentials or the session as part of the request for news.

While the call to the server is slightly more complicated, this is completely overshadowed by the complexity of coordinating 2 calls and failure points that it removes.

<u>Solution</u>

Yes, this adds some complexity to the server side but the server is significantly easier to test, maintain and update than the mobile app.

#### A REST API Called from a Mobile Application (Redux)

Some time passes from the above example and the app is updated and now it needs to download the weather and the news when it starts. In common REST ideology, we consider the news and weather to be separate entities and therefore, the request is to add a separate endpoint in order to be RESTful.

<u>What's Wrong with This?</u>

We are back to making 2 round trips to the server. But this time they are concurrent, which results in:

- 2 potential points of failure (again)
- Additional code complexity of handling the additional points of failure and partial failures (again)
- Paying battery and data charges for 2 calls (again)

<u>Finding a Better UX</u>

Let's run through the "UX Discovery Survey":

Unsurprisingly, the answers will be similar to the previous section.

However, let's now also consider the user of the app (in addition to the app as the user of the API)

- **Who/What is the user?** - This time, let's consider the problem from the app user's perspective.
- **What do they want to achieve?** - The answer to this question becomes the key to understanding how the app should behave.  Does the user need both pieces of info in an "all or nothing" way?  Would partial info be better than none?  Does the user need all of that info when the app starts or could they wait for retries?  Bigger more complicated calls are bound to take a little longer.  Users these days are fairly used to content that "fills itself in" eventually but they doesn't mean they like it.  Beyond that, not all information is of equal value to the user. If we are making a news app, the weather may be a "nice to have" for most users.
- **What are they capable of?** - As before.
- **What can I do to make their life easier?** - As before, this is the key. Whatever the user most wants/needs wins.
- **Is there anything similar out there that the user already knows how to use?** - Not applicable here.

<u>Solution</u>

Sadly, my answer here is "it depends". I would look to make as few round trips as possible and sacrifice RESTful correctness for performance or a better UX. The focus should always be on the end user and their needs. Both explicit (seeing the data/using the app) and implicit (costing less battery and data).

There is often a temptation to follow whatever is easiest or quickest to implement. This is a valid optimisation when you need to get to market as fast as possible but it is also a debt, akin to technical debt, that will need to be paid sooner or later.

#### An RPC API

This time an internal (behind the firewall) service publishes an RPC API that allows a user to download an eBook. However, this book should only be accessible to certain users.

As this service is not publicly accessible, we could ignore the validation and assume that calls to the API are only made in cases where the permission have already been verified.

<u>What's Wrong with This?</u>

- If the calling system is not aware of whether the user is permitted to perform this action, they will need to load this permission (perhaps from another system) before making the request.
- If a second system also needs to make this API call, then the logic to validate the user can perform the action would need to be duplicated into this new system.
- Any attempt to cache this permission in the calling systems would likely be inefficient and prone to duplication.

<u>Finding a better UX</u>

Let's run through the "UX Discovery Survey":

- **Who/What is the user?** - The other systems / API consumers.
- **What do they want to achieve?** - They want to download the book on behalf of their user, if the user is permitted to do so.
- **What are they capable of?** - Anything.
- **What can I do to make their life easier?** - We could take complete ownership of the problem and allow our users to make blind / dumb calls to our API and we take care of everything else.
- **Is there anything similar out there that the user already knows how to use?** - This question needs to asked within the problem space / company you are in. If all of your APIs are trusted then it might be better to follow that style rather than force your users to learn / handle your different way of doing things. Word of caution though: APIs should very often be stateless and require no more knowledge than how to call it; if all of your APIs are trusted then I suggest you raise that issue with your team.

<u>Solution</u>

You could introduce a gateway service between the callers and the destination; however this is likely adding complexity, latency and another service to build, manage and maintain. A generally more effective option is to push the validation logic into the RPC server.

This will:

- Eliminate any duplication between multiple clients.
- Likely improve the overall performance as the storage / caching of the permissions can be optimised for this use-case.
- Improve the UX to the users by allowing them to blindly make the request.

#### Code APIs

The general problem here is the fact that code inherently makes more sense to the person writing it, when they are writing it, than it does the others and even to the writer in the future. Seldom do we think about other users when we are writing our functions.

Consider the following code:

~~~
AddBalance(5, false)
~~~

What does the `false` indicate?

<u>Finding a Better UX</u>

Let's run through the "UX Discovery Survey":

- **Who/What is the user?** - Your future self. Your current and future team members.
- **What do they want to achieve?** - They want to use your code so they don't have to write their own.
- **What are they capable of?** - There are many answers to this question, some nice and some not so nice. Generally, it's better to assume the skill level is low and so is the domain knowledge.
- **What can I do to make their life easier?** - Personally, I am lazy. This laziness forces me to come from a place of "what interface would allow my future self to use this without thinking or learning?"
- **Is there anything similar out there that the user already knows how to use?** - Consistency in programming style, naming and many other things is programming will go a long way to a better UX. Often people will make the argument that a certain piece of code is "X style" where X is the current programming language or framework. I used to see this as a weak argument but as the teams I worked in got larger, consistency of style (preferably the team's agreed and published style) has proven extremely valuable in terms of allowing folks to change teams, share code and tips and most importantly learn from each other.

<u>Solution</u>

What happens to the usability if we replace the boolean parameter with 2 functions?

~~~
AddBalanceCreateIfMissing(5)

AddBalanceFailOnMissing(5)
~~~

In actual fact, the result will often be 3 functions. These 2 above public / exported functions and the original function / common code as private.

Boolean arguments are an easy target but there are many other easy and quick wins, consider this function:

~~~
var day = toDay("Monday")
~~~

What happens if we call it like this?

~~~
var day = toDay("MONDAY")
var day = toDay("monday")
var day = toDay("mon")
~~~

These are great examples of **"What can I do to make their life easier?"**.

A good UX would consider all reasonable ways a user might use or misuse the interface and in many cases support them instead of forcing the user to learn and then remember the exact format required.

### TL;DR

- UX is not just about Visual User Interfaces.
- APIs and SDKs are also user interfaces.
- Programmers are also users.
- Other systems are also users.
- UX is about designing the interface or interaction from the user's perspective.
- It's about considering the user's desires, tendencies and capabilities.
- It's about making the system feel like "it just works".

Finally, I would mention that the best UX are the result of iterative and interactive efforts.

The best way to answer the questions of **"What do they want to achieve?"**, **"What are they capable of?"** and **"What can I do to make their life easier?"** is to give the interface to a real user, watch what they do it with it and how. Then respond by making the interface work they way they thought it would instead of teaching them otherwise.

It is always better (and easier) to change the UX to match the user than the other way around.
