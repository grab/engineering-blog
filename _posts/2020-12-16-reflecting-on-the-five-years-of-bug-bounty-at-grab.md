---
layout: post
id: 2020-12-16-reflecting-on-the-five-years-of-bug-bounty-at-grab
title: Reflecting on the Five Years of Bug Bounty at Grab
date: 2020-12-16 00:00:00
authors: [ajay-srivastava, aniket-kulkarni, avinash-singh, nathaniel-callens]
categories: [Security]
tags: [Security, HackerOne, Bug Bounty]
comments: true
cover_photo: /img/reflecting-on-the-five-years-of-bug-bounty-at-grab/cover.jpg
excerpt: "Read about how the product security team's bug bounty programme has helped keep Grab secure."
---

Security has always been a top-priority at Grab; our product security team works round-the-clock to ensure that our consumers' data remains safe. Five years ago, we launched our private bug bounty programme on [HackerOne](https://hackerone.com/grab), which evolved into a public programme in August 2017. The idea was to complement the security efforts our team has been putting through to keep Grab secure. We were a pioneer in Southeast Asia to implement a public bug bounty programme, and now we stand among the [Top 20 programmes on HackerOne](https://www.hackerone.com/resources/e-book/top-20-public-bug-bounty-programs) worldwide.

We started as a private bug bounty programme which provided us with fantastic results, thus encouraging us to increase our reach and benefit from the vibrant security community across the globe which have helped us iron-out security issues 24x7 in our products and infrastructure. We then publicly launched our bug bounty programme offering competitive rewards and hackers can even earn additional bonuses if their report is well-written and display an innovative approach to testing.

In 2019, we also enrolled ourselves in the [Google Play Security Reward Programme (GPSRP)](https://hackerone.com/googleplay), Offered by Google Play, GPSRP allows researchers to re-submit their resolved mobile security issues directly and get additional bounties if the report qualifies under the GPSRP rules. A selected number of Android applications are eligible, including Grab’s Android mobile application. Through the participation in GPSP, we hope to give researchers the recognition they deserve for their efforts.

In this blog post, we're going to share our journey of running a bug bounty programme, challenges involved and share the learnings we had on the way to help other companies in SEA and beyond to establish and build a successful bug bounty programme.

## Transitioning from Private to a Public Programme

At Grab, before starting the private programme, we defined [policy and scope](https://docs.hackerone.com/programs/policy-and-scope.html), allowing us to communicate the objectives of our bug bounty programme and list the targets that can be tested for security issues. We did a security sweep of the targets to eliminate low-hanging security issues, assigned people from the security team to take care of incoming reports, and then launched the programme in private mode on HackerOne with a few chosen researchers having demonstrated a history of submitting quality submissions.

One of the benefits of running a [private bug bounty programme](https://docs.hackerone.com/programs/private-vs-public-programs.html) is to have some control over the number of incoming submissions of potential security issues and researchers who can report issues. This ensures the quality of submissions and helps to control the volume of bug reports, thus avoiding overwhelming a possibly small security team with a deluge of issues so that they won't be overwhelming for the people triaging potential security issues. The invited researchers to the programme are limited, and it is possible to invite researchers with a known track record or with a specific skill set, further working in the programme's favour.

The results and lessons from our private programme were valuable, making our programme and processes mature enough to [open the bug bounty programme](https://www.techinasia.com/grab-public-bug-bounty) to security researchers across the world. We still did another security sweep, reworded the policy, redefined the targets by expanding the scope, and allocated enough folks from our security team to take on the initial inflow of reports which was anticipated to be in tune with other public programmes.


<div class="post-image-section"><figure>
  <img src="/img/reflecting-on-the-five-years-of-bug-bounty-at-grab/image1.png" alt="Submissions">
</figure></div>

_Noticeable spike in the number of incoming reports as we went public in July 2017._

## Lessons Learned from the Public Programme

Although we were running our bug bounty programme in private for sometime before going public, we still had not worked much on building standard operating procedures and processes for managing our bug bounty programme up until early 2018. Listed below, are our key takeaways from 2018 till July 2020 in terms of improvements, challenges, and other insights.

1.  **Response Time**: No researcher wants to work with a bug bounty team that doesn't respect the time that they are putting into reporting bugs to the programme. We initially didn't have a formal process around response times, because we wanted to encourage all security engineers to pick-up reports. Still, we have been consistently delivering a first response to reports in a matter of hours, which is significantly lower than the top 20 bug bounty programmes running on HackerOne. Know what structured (or unstructured) processes work for your team in this area, because your programme can see significant rewards from fast response times.
2.  **Time to Bounty**: In most bug bounty programmes the payout for a bug is made in one of the following ways: full payment after the bug has been resolved, full payment after the bug has been triaged, or paying a portion of the bounty after triage and the remaining after resolution. We opt to pay the full bounty after triage. While we're always working to speed up resolution times, that timeline is in our hands, not the researcher's. Instead of making them wait, we pay them as soon as impact is determined to incentivise long-term engagement in the programme.
3.  **Noise Reduction**: With [HackerOne Triage](https://www.hackerone.com/services) and [Human-Augmented Signal](https://www.hackerone.com/blog/Double-your-signal-double-your-fun), we're able to focus our team's efforts on resolving unique, valid vulnerabilities. Human-Augmented Signal flags any reports that are likely false-positives, and Triage provides a validation layer between our security team and the report inbox. Collaboration with the HackerOne Triage team has been fantastic and ultimately allows us to be more efficient by focusing our energy on valid, actionable reports. In addition, we take significant steps to block traffic coming from networks running automated scans against our Grab infrastructure and we're constantly exploring this area to actively prevent automated external scanning.
4.  **Team Coverage**: We introduced a team scheduling process, in which we assign a security engineer (chosen during sprint planning) on a weekly basis, whose sole responsibility is to review and respond to bug bounty reports. We have integrated our systems with HackerOne’s API and PagerDuty to ensure alerts are for valid reports and verified as much as possible.

## Looking Ahead

One area we haven't been doing too great is ensuring higher rates of participation in our core mobile applications; some of the pain points researchers have informed us about while testing our applications are:

*   Researchers' accounts are getting blocked due to our [anti-fraud checks](https://engineering.grab.com/using-grabs-trust-counter-service-to-detect-fraud-successfully).
*   Researchers are not able to register driver accounts (which is understandable as our driver-partners have to go through manual verification process)
*   Researchers who are not residing in the Southeast Asia region are unable to complete end-to-end flows of our applications.

We are open to community feedback and how we can improve. We want to hear from you! Please drop us a note at [infosec.bugbounty@grab.com](mailto:infosec.bugbounty@grab.com) for any programme suggestions or feedback.

Last but not least, we’d like to thank all researchers who have contributed to the Grab programme so far. Your immense efforts have helped keep Grab’s businesses and users safe. Here’s a shoutout to our programme’s top-earning hackers [🏆](https://emojipedia.org/trophy/%23:~:text%3DThe%2520trophy%2520emoji%2520is%2520a,the%2520bottom%2520detailing%2520the%2520award.%26text%3DTrophy%2520was%2520approved%2520as%2520part,to%2520Emoji%25201.0%2520in%25202015.):

**Overall Top 3 Researchers**
1. [@reptou](https://hackerone.com/reptou?type%3Duser)
2. [@quanyang](https://hackerone.com/quanyang?type%3Duser)
3. [@ngocdh](https://hackerone.com/ngocdh?type%3Duser)

**Year 2019/2020 Top 3 Researchers**
1. [@reptou](https://hackerone.com/reptou?type%3Duser)
2. [@alexeypetrenko](https://hackerone.com/alexeypetrenko?type%3Duser)
3. [@chaosbolt](https://hackerone.com/chaosbolt?type%3Duser)

Lastly, here is a special shoutout to [@bagipro](https://hackerone.com/bagipro) who has done some great work and testing on our Grab mobile applications!

Well done and from everyone on the Grab team, we look forward to seeing you on the programme!

## Join us

Grab is a leading superapp in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across over 400 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
