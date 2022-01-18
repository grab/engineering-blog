---
layout: post
id: 2022-01-20-biometrics-authentication
title: Biometric authentication - Why do we need it?
date: 2022-01-16 00:20:00
authors: [chad-burgess, rachel-fong]
categories: [Security]
tags: [Engineering, Security]
comments: true
cover_photo: /img/biometrics-authentication/cover.jpg
excerpt: "As cyberattacks get more advanced, authentication methods like one-time passwords (OTPs) and personal identification numbers (PINs) are no longer enough to protect your users. Find out how biometric authentication can help enhance security."
---

In recent years, Identity and Access Management has gained importance within technology industries as attackers continue to target large corporations in order to gain access to private data and services. To address this issue, the Grab Identity team has been using a 6-digit PIN to authenticate a user during a sensitive transaction such as accessing a GrabPay Wallet. We also use SMS one-time passwords (OTPs) to log a user into the application.

We look at existing mechanisms that Grab uses to authenticate its users and how biometric authentication helps strengthen application security and save costs. We also look at the various technical decisions taken to ensure the robustness of this feature as well as some key learnings.

## Introduction

The mechanisms we use to authenticate our users have evolved as the Grab Identity team consistently refines our approach. Over the years, we have observed several things:

* OTP and Personal Identification Number (PIN) are susceptible to hacking and social engineering.
* These methods have high user friction (e.g. delay or failure to receive SMS, need to launch Facebook/Google).
* Shared/Rented driver accounts cause safety concerns for passengers and increases potential for fraud
* High OTP costs at $0.03/SMS.

Social engineering efforts have gotten more advanced - attackers could pretend to be your friends and ask for your OTP or even post phishing advertisements that prompt for your personal information.

| <img src="/img/biometrics-authentication/image3.png" alt="Search data flow"> | <img src="/img/biometrics-authentication/image1.png" alt="Search data flow"> |

<div class="post-image-section"><figure>
  <img src="/img/biometrics-authentication/image2.png" alt="Search data flow" style="width:60%">
  </figure>
</div>

With more sophisticated social engineering attacks on the rise, we need solutions that can continue to protect our users and Grab in the long run.

## Background

When we looked into developing solutions for these problems, which was mainly about cost and security, we went back to basics and looked at what a secure system meant.

* Knowledge Factor: Something that you know (password, PIN, some other data)
* Possession Factor: Something physical that you have (device, keycards)
* Inherent Factor: Something that you are (face ID, fingerprint, voice)

We then compared the various authentication mechanisms that the Grab app currently uses, as shown in the following table:

<table border="1" style="text-align: center">
<tr style="text-align:center">
  <td> <strong>Authentication factor</strong></td>
  <td> <strong>1. Something that you know</strong> </td>
  <td> <strong>2. Something physical that you have</strong> </td>
  <td> <strong>3. Something that you are</strong> </td>
</tr>
<tr>
  <td>OTP</td>
  <td>✔️</td>
  <td>✔️</td>
  <td></td>
</tr>
<tr>
  <td>Social</td>
  <td>✔️</td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>PIN</td>
  <td>✔️</td>
  <td></td>
  <td></td>
</tr>
<tr>
  <td>Biometrics</td>
  <td></td>
  <td>✔️</td>
  <td>✔️</td>
</tr>
</table>


With methods based on the knowledge and possession factors, it is still possible for attackers to get users to reveal sensitive account information. On the other hand, biometrics are something you are born with and that makes it more complex to mimic. Hence, we have added biometrics as an additional layer to enhance Grab’s existing authentication methods and build a more secure platform for our users.

## Solution

Biometric authentication powered by device biometrics provides a robust platform to enhance trust. This is because modern phones provide a few key features that allow client server trust to be established:

1. Biometric sensor (fingerprint or face ID)
2. Advent of devices with secure enclaves

A secure enclave, being a part of the device, is separate from the main operating system (OS) at the kernel level. The enclave is used to store private keys that can be unlocked only by the biometrics on the device.

Any changes to device security such as changing a PIN or adding another fingerprint will invalidate all prior access to this secure enclave. This means that when we enroll a user in biometrics this way, we can be sure that any payload from said device that matches the public part of said private key is authorised by the user that created it.

<div class="post-image-section"><figure>
  <img src="/img/biometrics-authentication/image4.png" alt="Search data flow" style="width:60%">
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/biometrics-authentication/image6.png" alt="Search data flow" style="width:60%">
  </figure>
</div>

### Architecture details

The important part of the approach lies in the enrollment flow. The process is quite simple and can be described in the following steps:

1. Create an elevated public/private key pair that requires users authentication
2. Ask users to authenticate in order to prove they are the device holders
3. Sign payload with confirmed unlocked private key and send public key to finish enrolling
4. Store returned reference id in the encrypted shared preferences/keychain

<div class="post-image-section"><figure>
  <img src="/img/biometrics-authentication/image5.png" alt="Search data flow" style="width:60%">
  </figure>
</div>

### Implementation

The key implementation details is as follows:

1. Grab’s HellfireSDK confirms if the device is not rooted.
2. Uses SHA512withECDSA for hashing algorithm
3. Encrypted shared preferences/keychain to store data
4. Secure enclave to store private keys

These key technologies allow us to create trust between devices and services. The raw biometric data stays within the device and instead sends an encrypted signature of biometry data to Grab for verification purposes.

### Impact

Biometric login aims to resolve the many problems highlighted earlier in this article such as reducing user friction and saving SMS OTP costs.

We are still experimenting with this feature so we do not have insights on business impact yet. However, from early experiment runs, we estimate over 90% adoption rate and a success rate of nearly 90% for biometric logins.

## Learnings/Conclusion

As methods of executing identity theft or social engineering get more creative, simply using passwords and PINs is not enough. Grab, and many other organisations, are realising that it’s important to augment existing security measures with methods that are inherent and unique to users.

By using biometrics as an added layer of security in a multi-factor authentication strategy, we can keep our users safe and decrease the probability of successful attacks. Not only do we ensure that the user is a legitimate entity, we also ensure that we protect their privacy by ensuring that the biometric data remains on the user’s device.

## What’s next?

* IdentitySDK - this feature will be moved into an SDK so other teams integrate it via plug and play.
* Standalone biometrics - biometric authentication is currently tightly coupled with PIN i.e. biometric authentication happens in place of PIN if biometric authentication is set up. Therefore, users would never see both PIN and biometric in the same session, which limits our robustness in terms of multi-factor authentication.
* Integration with DAX and beyond - We plan to enable this feature for all teams who need to use biometric authentication.
