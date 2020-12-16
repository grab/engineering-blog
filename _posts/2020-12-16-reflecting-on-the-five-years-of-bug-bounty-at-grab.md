Reflecting on the five years of Bug Bounty at Grab

Security has always been a top-priority at Grab; our product security team works round-the-clock to ensure that our customers' data remains safe. Five years ago, we launched our private bug bounty program on [HackerOne](https://www.google.com/url?q=https://hackerone.com/grab&sa=D&ust=1608099082857000&usg=AOvVaw1p1i8bQc3a3CWb2pBlvSP8), which evolved into a public program in August 2017. The idea was to complement the security efforts our team has been putting through to keep Grab secure. We were a pioneer in South East Asia to implement a public bug bounty program, and now we stand among the [Top 20 programs on HackerOne](https://www.google.com/url?q=https://www.hackerone.com/resources/e-book/top-20-public-bug-bounty-programs&sa=D&ust=1608099082857000&usg=AOvVaw2mYZZkF5q2xdRF2lMt7NJo) worldwide.

We started as a private bug bounty program which provided us with fantastic results, thus encouraging us to increase our reach and benefit from the vibrant security community across the globe which have helped us iron-out security issues 24x7 in our products and infrastructure. We then publicly launched our bug bounty program offering competitive rewards and hackers can even earn additional bonuses if their report is well-written and display an innovative approach to testing.

In 2019, we also enrolled ourselves in the [Google Play Security Reward Program (GPSRP)](https://www.google.com/url?q=https://hackerone.com/googleplay&sa=D&ust=1608099082860000&usg=AOvVaw0sOdiTzSqlxSWMaU8-Zl7G), Offered by Google Play, GPSRP allows researchers to re-submit their resolved mobile security issues directly and get additional bounties if the report qualifies under the GPSRP rules. A selected number of Android applications are eligible, including Grab’s Android mobile application. Through the participation in GPSP, we hope to give researchers the recognition they deserve for their efforts.

In this blog post, we're going to share our journey of running a bug bounty program, challenges involved and share the learnings we had on the way to help other companies in SEA and beyond to establish and build a successful bug bounty program.

Transitioning from Private to a Public Program
==============================================

At Grab, before starting the private program, we defined [policy and scope](https://www.google.com/url?q=https://docs.hackerone.com/programs/policy-and-scope.html&sa=D&ust=1608099082862000&usg=AOvVaw0sRiR0aGi15mksP-KpH6Sb), allowing us to communicate the objectives of our bug bounty program and list the targets that can be tested for security issues. We did a security sweep of the targets to eliminate low-hanging security issues, assigned people from the security team to take care of incoming reports, and then launched the program in private mode on HackerOne with a few chosen researchers having demonstrated a history of submitting quality submissions.

One of the benefits of running a [private bug bounty program](https://www.google.com/url?q=https://docs.hackerone.com/programs/private-vs-public-programs.html&sa=D&ust=1608099082863000&usg=AOvVaw2Zh4Gdnj1sg6cEw8lE88Ve) is to have some control over the number of incoming submissions of potential security issues and researchers who can report issues. This ensures the quality of submissions and helps to control the volume of bug reports, thus avoiding overwhelming a possibly small security team with a deluge of issues so that they won't be overwhelming for the people triaging potential security issues. The invited researchers to the program are limited, and it is possible to invite researchers with a known track record or with a specific skill set, further working in the program's favour.

The results and lessons from our private program were valuable, making our program and processes mature enough to [open the bug bounty program](https://www.google.com/url?q=https://www.techinasia.com/grab-public-bug-bounty&sa=D&ust=1608099082864000&usg=AOvVaw3kVutLMcruJul-NkWRXMIF) to security researchers across the world. We still did another security sweep, reworded the policy, redefined the targets by expanding the scope, and allocated enough folks from our security team to take on the initial inflow of reports which was anticipated to be in tune with other public programs.

![](images/image1.png)

Noticeable spike in the number of incoming reports as we went public in July 2017.

Lessons Learned from the Public Program
=======================================

Although we were running our bug bounty program in private for sometime before going public, we still had not worked much on building standard operating procedures and processes for managing our bug bounty program up until early 2018. Listed below, are our key takeaways from 2018 till July 2020 in terms of improvements, challenges, and other insights.

1.  Response Time: No researcher wants to work with a bug bounty team that doesn't respect the time that they are putting into reporting bugs to the program. We initially didn't have a formal process around response times, because we wanted to encourage all security engineers to pick-up reports. Still, we have been consistently delivering a first response to reports in a matter of hours, which is significantly lower than the top 20 bug bounty programs running on HackerOne. Know what structured (or unstructured) processes work for your team in this area, because your program can see significant rewards from fast response times.
2.  Time to Bounty: In most bug bounty programs the payout for a bug is made in one of the following ways: full payment after the bug has been resolved, full payment after the bug has been triaged, or paying a portion of the bounty after triage and the remaining after resolution. We opt to pay the full bounty after triage. While we're always working to speed up resolution times, that timeline is in our hands, not the researcher's. Instead of making them wait, we pay them as soon as impact is determined to incentivize long-term engagement in the program.
3.  Noise Reduction: With [HackerOne Triage](https://www.google.com/url?q=https://www.hackerone.com/services&sa=D&ust=1608099082866000&usg=AOvVaw17ka4kkyMI8z8-8HAc63tQ) and [Human-Augmented Signal](https://www.google.com/url?q=https://www.hackerone.com/blog/Double-your-signal-double-your-fun&sa=D&ust=1608099082867000&usg=AOvVaw3B5SqbjW2pc_1S5ku_pxxj), we're able to focus our team's efforts on resolving unique, valid vulnerabilities. Human-Augmented Signal flags any reports that are likely false-positives, and Triage provides a validation layer between our security team and the report inbox. Collaboration with the HackerOne Triage team has been fantastic and ultimately allows us to be more efficient by focusing our energy on valid, actionable reports. In addition, we take significant steps to block traffic coming from networks running automated scans against our Grab infrastructure and we're constantly exploring this area to actively prevent automated external scanning.
4.  Team Coverage: We introduced a team scheduling process, in which we assign a security engineer (chosen during sprint planning) on a weekly basis, whose sole responsibility is to review and respond to bug bounty reports. We have integrated our systems with HackerOne’s API and PagerDuty to ensure alerts are for valid reports and verified as much as possible.

### \# Looking Ahead

In one area we haven't been doing too great is ensuring higher rates of participation in our core mobile applications; some of the pain points researchers have informed us about while testing our applications are:

*   Researchers' accounts are getting blocked due to our [anti-fraud checks](https://www.google.com/url?q=https://engineering.grab.com/using-grabs-trust-counter-service-to-detect-fraud-successfully&sa=D&ust=1608099082869000&usg=AOvVaw24VaDmWqaua2tozN9esBBB).
*   Researchers are not able to register driver accounts (which is understandable as our driver-partners have to go through manual verification process)
*   Researchers who are not residing in the Southeast Asia region are unable to complete end-to-end flows of our applications.

We are open to community feedback and how we can improve. We want to hear from you! Please drop us a note at [infosec.bugbounty@grab.com](mailto:infosec.bugbounty@grab.com) for any program suggestions or feedback.

Last but not least, we’d like to thank all researchers who have contributed to the Grab program so far. Your immense efforts have helped keep Grab’s businesses and users safe. Here’s a shoutout to our program’s top-earning hackers [🏆](https://www.google.com/url?q=https://emojipedia.org/trophy/%23:~:text%3DThe%2520trophy%2520emoji%2520is%2520a,the%2520bottom%2520detailing%2520the%2520award.%26text%3DTrophy%2520was%2520approved%2520as%2520part,to%2520Emoji%25201.0%2520in%25202015.&sa=D&ust=1608099082872000&usg=AOvVaw17zEXB-7xlri2DN0svHRJ4):

Ranking

Overall Top 3 Researchers

Year 2019/2020 Top 3 Researchers

1.

[@reptou](https://www.google.com/url?q=https://hackerone.com/reptou?type%3Duser&sa=D&ust=1608099082875000&usg=AOvVaw23HAtpwbldwm08IavjEzEI)

[@reptou](https://www.google.com/url?q=https://hackerone.com/reptou?type%3Duser&sa=D&ust=1608099082876000&usg=AOvVaw0qQjgkjIqodR9Ox5Rezjz-)

2.

[@quanyang](https://www.google.com/url?q=https://hackerone.com/quanyang?type%3Duser&sa=D&ust=1608099082878000&usg=AOvVaw1FphT-QXdMLwOusfDiv5bm)

[@alexeypetrenko](https://www.google.com/url?q=https://hackerone.com/alexeypetrenko?type%3Duser&sa=D&ust=1608099082879000&usg=AOvVaw0_fU9akCO3y0OgsZIpDWam)

3.

[@ngocdh](https://www.google.com/url?q=https://hackerone.com/ngocdh?type%3Duser&sa=D&ust=1608099082881000&usg=AOvVaw2tL0QP_jqgF1mP5A0toa6p)

[@chaosbolt](https://www.google.com/url?q=https://hackerone.com/chaosbolt?type%3Duser&sa=D&ust=1608099082883000&usg=AOvVaw0Xlxw1cE04HCXGitUvxIK1)

Lastly, here is a special shoutout to [@bagipro](https://www.google.com/url?q=https://hackerone.com/bagipro&sa=D&ust=1608099082883000&usg=AOvVaw2HPdBR12nenJWM-VCyRDnE) who has done some great work and testing on our Grab mobile applications!

Well done and from everyone on the Grab team, we look forward to seeing you on the program!
