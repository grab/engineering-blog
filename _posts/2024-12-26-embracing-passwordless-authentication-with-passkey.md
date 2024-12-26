---
layout: post
id: 2024-12-26-embracing-passwordless-authentication-with-passkey
title: 'Embracing passwordless authentication with Grab’s Passkey'
date: 2024-12-26 00:00:10
authors: [ocean-nguyen, zharif-khairuddin, renshi-bao, edmund-lui]
categories: [Engineering, Security]
tags: [Engineering, Security]
comments: true
cover_photo: /img/embracing-passwordless-authentication-with-passkey/cover.png
excerpt: "Find out how Passkey makes logging in easier and safer by introducing passwordless authentication. Learn how this new feature works, the benefits it brings, and why it's a game-changer for your security and convenience. Dive in to see how Grab is making your app experience smoother and more secure."
---

## Abstract

This blog post introduces Passkey — our latest addition to the Grab app — a step towards a secure, passwordless future. It provides an in-depth look at this innovative authentication method that allows users to have full control over their security, making authentication seamless and phishing-resistant. By the end of this piece, you will understand why we developed Passkey, how it works, the challenges we overcame, and the benefits brought to us post-launch. Whether you're a tech enthusiast, a cybersecurity follower, or a Grab user, this piece offers valuable insights into the passwordless authentication sphere and Grab’s commitment to user safety and comfort.

## Introduction

In the evolving world of digital security, Grab has always prioritised user account safety. A significant part of this involves exploring more secure and user-friendly authentication methods. Enter Grab's Passkey — a major step towards passwordless authentication that leverages the Fast IDentity Online [(FIDO) standard](https://fidoalliance.org/passkeys/), giving users full control over their security, and making authentication seamless.

## Background

Traditionally, the authentication process primarily relies on passwords — a precarious practice given the vulnerability to various security threats, such as phishing, keystroke logging, and brute-force attacks. This downside leads to the pursuit of safer, more user-friendly alternatives. Among these is the introduction of passwordless authentication.

A passwordless authentication method eliminates the need for users to enter traditional passwords during the verification process. Instead, it employs alternatives like:

- **Email link**: A one-time clickable link sent via email.
- **One-Time Passcodes (OTPs)**: Temporary codes sent to users.
- **Social logins**: Using existing profiles on platforms like Facebook or Google to sign in.
- **Authenticator apps**: Software that generates time-sensitive codes.

## Solution

Recognising the limitations and security issues of traditional password-based authentication, we turned to a more secure, user-friendly solution - the passwordless authentication system. Among other methods, we are also enabling Passkey, built on the FIDO standard. This global standard fosters wider adoption and support from consumer brands, making Passkey a secure and convenient choice.

### Why Passkey?

Given the rapidly evolving security threats in the digital space, we selected Passkey for its unique benefits in providing both enhanced security and a seamless user experience. Passkey offers enhanced security as it is phishing-resistant and doesn't require secrets to be stored in Grab's database. Instead, secrets are securely kept within the user's device, putting the control in their hands and significantly reducing the chances of exposure.

### Fast-paced adoption of Passkey

Passkey technology is not only promising in theory but also successful in practice, as evidenced by its wider industry adoption. Consumers are adopting passkeys at a rapid pace in 2024. With large global consumer brands, such as Adobe, Amazon, Apple, Google, Hyatt, Nintendo, PayPal, Playstation, Shopify and TikTok enabling passkey technology for their users, more than 13 billion accounts can now leverage passkeys for sign-in.

In a recent [FIDO Alliance independent study](https://fidoalliance.org/content-ebook-consumer-password-and-passkey-trends-wpd-2024/#:~:text=To%20commemorate%20World%20Password%20Day,attitudes%20towards%20authentication%20are%20evolving) conducted on World Password Day 2024 across the U.S. and UK, findings reveal:

- A majority of people are aware of passkey technology (62%).
- Over half have enabled passkeys on at least one of their accounts (53%).
- Once they adopt a passkey, nearly a quarter enable a passkey whenever possible (23%).
- A large number believe passkeys are more secure (61%) and more convenient than passwords (58%).

These trends clearly illustrate why we chose to implement Passkey as our passwordless solution.

## Architecture details

### How do passkeys work?

There are three components of the passkey flow:

- **Backend**: Holds the accounts database storing the public key and other metadata about the passkey.
- **Frontend**: Communicates with the authenticator and sends requests to the backend.
- **Authenticator**: The user's authenticator creates and stores the passkey. This may be implemented in the operating system underlying the user agent, in external hardware, or a combination of both.

<div class="post-image-section"><figure>
  <img src="/img/embracing-passwordless-authentication-with-passkey/high-level-passkey-authentication.png" alt="" style="width:80%"><figcaption align="middle">Figure 1. A high-level overview of the passkey authentication.</figcaption>
  </figure>
</div>

### Supported environments

**Google Password Manager**: Stores, serves and synchronises passkeys on Android and Chrome. Passkeys are securely backed up and synced between Android devices where the user is signed using the same Google account, and available passkeys are listed.

**iCloud Keychain**: Synchronises the saved passkey to other Apple devices that run macOS, iOS, or iPadOS where the user is signed in using the same iCloud account.

## Implementation

In this section, we illustrate the usage of passkeys in several scenarios.

### Creating a new passkey

<div class="post-image-section"><figure>
  <img src="/img/embracing-passwordless-authentication-with-passkey/passkey-registration.png" alt="" style="width:80%"><figcaption align="middle">Figure 2. Passkey registration steps in Grab app.</figcaption>
  </figure>
</div>

1. The user signs into the Grab app and selects **Enable Passkey**.
2. Frontend requests user details and a challenge from Backend.
3. Authenticator creates the user’s passkey upon their consent using their device’s screen lock.
4. This passkey, along with other data, is sent back to Frontend.
5. Frontend sends the public key credential to Backend for storage and future authentications.

<div class="post-image-section"><figure>
  <img src="/img/embracing-passwordless-authentication-with-passkey/sequence-diagram-passkey-registration.png" alt="" style="width:80%"><figcaption align="middle">Figure 3. Sequence diagram of Passkey registration.</figcaption>
  </figure>
</div>

## Creating a passkey - notable Webauthn parameters

1. When the user selects **Enable Passkey**, Frontend fetches the following information to call [navigator.credentials.create()](https://www.w3.org/TR/webauthn-2/#sctn-sample-registration) from Backend:
  - **[challenge](https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-challenge)**: server-generated challenge.
  - **[user](https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-user).id**: user's unique ID, stored as ArrayBuffer.
  - **user.name**: unique username or email for account recognition.
  - **user.displayName**: user-friendly name for the account.
  - **[excludeCredentials](https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-excludecredentials)**: to prevent registering the same device multiple times.
  - **[rp](https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-rp).id**: Domain or a registrable suffix of an RP's origin.
  - **rp.name**: Name of the RP.
  - **[pubKeyCredParams](https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-pubkeycredparams)**: Specifies RP's public-key algorithms.
  - **[authenticatorSelection](https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-authenticatorselection).authenticatorAttachment**: Indicates type of authenticator attachment desired.
  - **authenticatorSelection.requireResidentKey**: Indicates if resident key is needed.
  - **authenticatorSelection.userVerification**: Indicates if user verification is *required*, *preferred*, or *discouraged*.

2. Frontend invokes WebAuthn API to create a passkey.

    ```
    const publicKeyCredentialCreationOptions = {
      challenge: *****,
      rp: {
        name: "Example",
        id: "example.com",
      },
      user: {
        id: *****,
        name: "john78",
        displayName: "John",
      },
      pubKeyCredParams: [{alg: -7, type: "public-key"},{alg: -257, type: "public-key"}],
      excludeCredentials: [{
        id: *****,
        type: 'public-key',
        transports: ['internal'],
      }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        requireResidentKey: true,
      }
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    });

    // Encode and send the credential to the server for verification.
    ```

3. Post user consent, passkey is created and returned along with relevant data to the frontend.
4. Frontend sends the public key credential to Backend where it gets stored for future authentication.
  - [PublicKeyCredential](https://w3c.github.io/webauthn/#authenticatorattestationresponse) object returned includes properties like [id](https://w3c.github.io/webauthn/#credential-id), [rawId](https://w3c.github.io/webauthn/#credential-id), [response.clientDataJSON](https://w3c.github.io/webauthn/#client-data), [response.attestationObject](https://w3c.github.io/webauthn/#attestation-object), [authenticatorAttachment](https://w3c.github.io/webauthn/#enumdef-authenticatorattachment), and **type** (“public-key”).
  - Libraries can be used for handling the public key credential object.

5. Backend receives and processes the object, and information is stored in the database for future use.

## Signing in with a passkey

<div class="post-image-section"><figure>
  <img src="/img/embracing-passwordless-authentication-with-passkey/passkey-authentication.png" alt="" style="width:80%"><figcaption align="middle">Figure 4. Passkey authentication steps in Grab app.</figcaption>
  </figure>
</div>

1. The user  launches the Grab app and opts to login using their passkey.
2. Frontend requests a challenge from Backend for passkey authentication.
3. The user  is shown their available passkeys.
4. Upon choosing a passkey, the user consents to using their device’s lock screen.
5. Frontend receives the public key credential and some data.
6. Frontend forwards these to the backend, which verifies them against the database and logs the user in.

Thus, Passkey enhances the login experience, providing an optimal blend of security and seamless usability.

<div class="post-image-section"><figure>
  <img src="/img/embracing-passwordless-authentication-with-passkey/sequency-diagram-passkey-authentication.png" alt="" style="width:80%"><figcaption align="middle">Figure 5. Sequence diagram of the Passkey authentication.</figcaption>
  </figure>
</div>

### Signing in with a passkey - notable Webauthn parameters

1. Frontend fetches a challenge from Backend.
  - **[challenge](https://w3c.github.io/webauthn/#dom-publickeycredentialcreationoptions-challenge)**: server-generated challenge, crucial to prevent replay attacks.
  - **[allowCredentials](https://w3c.github.io/webauthn/#dom-publickeycredentialrequestoptions-allowcredentials)**: array of acceptable credentials for authentication.
  - **[userVerification](https://w3c.github.io/webauthn/#dom-publickeycredentialrequestoptions-userverification)**: indicates whether user verification is required, preferred, or discouraged.
2. Frontend calls **[navigator.credentials.get()](https://www.w3.org/TR/webauthn-2/#sctn-sample-authentication)** to initiate user authentication.

    ```
    // To abort a WebAuthn call, instantiate an `AbortController`.

    const abortController = new AbortController();

    const publicKeyCredentialRequestOptions = {
      // Server generated challenge
      challenge: ****,
      // The same RP ID as used during registration
      rpId: 'example.com',
    };

    const credential = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
      signal: abortController.signal,
      // Specify 'conditional' to activate conditional UI
      mediation: 'conditional'
    });
    ```

3. Post user consent through their device's screen lock, a **[PublicKeyCredential](https://w3c.github.io/webauthn/#authenticatorassertionresponse)** object is returned to Frontend.
4. The returned **[PublicKeyCredential](https://w3c.github.io/webauthn/#authenticatorassertionresponse)** is sent to Backend for verification. Backend looks up matching credential ID and verifies the signature against the stored public key.
  - **[rp.id](https://w3c.github.io/webauthn/#dom-publickeycredentialrequestoptions-rpid)**: Must match the rp.id used when creating the passkey.
  - **[PublicKeyCredential](https://w3c.github.io/webauthn/#authenticatorassertionresponse)** object includes properties like **[id](https://w3c.github.io/webauthn/#credential-id)**, **[rawId](https://w3c.github.io/webauthn/#credential-id)**, **[response.clientDataJSON](https://w3c.github.io/webauthn/#client-data)**, **[response.authenticatorData](https://w3c.github.io/webauthn/#dom-authenticatorassertionresponse-authenticatordata)**, **[response.signature](https://w3c.github.io/webauthn/#dom-authenticatorassertionresponse-signature)**, **[response.userHandle](https://w3c.github.io/webauthn/#dom-authenticatorassertionresponse-userhandle)**, **[authenticatorAttachment](https://w3c.github.io/webauthn/#enumdef-authenticatorattachment)**, **type** (“public-key”).

## Impact

A frictionless login paints a positive picture for our users. No more waiting for OTPs or struggling with cumbersome two-factor authentication. With the implementation of Passkey, users will enjoy a smoother, faster, and more secure login process.

In addition to delivering a frictionless user experience, passkeys provide heightened security compared to conventional authentication methods such as OTPs and passwords, which demand active credential management.

Using passkeys for authentication can lead to cost savings by cutting down or eliminating fees related to third-party authentication services, communication expenses, and messaging platforms. This strategy not only boosts security and user experience but also enhances the financial efficiency of the authentication process.

Moving forward, our focus is on enhancing, streamlining, and extending the capabilities of Passkey. We are enthusiastic about the evolution of passwordless authentication and are dedicated to ongoing investments in technologies that deliver the utmost user satisfaction and experience.

## Conclusion

Leveraging passkeys for authentication provides heightened security, enhanced user experience, cost-effectiveness, decreased vulnerabilities, multi-factor authentication support, and simplified credential management. The future direction involves enhancing and broadening Passkey capabilities, with a dedication to investing in user-centric technologies that advance passwordless authentication. This commitment underscores the focus on delivering secure, efficient, and user-friendly authentication solutions for both existing and prospective users.

## What’s next

Looking ahead, based on the user adoption of Passkey and its anticipated impact on improving login convenience, we aim to explore the expansion of this feature to web login as well. We envision a scenario where users can leverage the power of their existing phone Passkey, no matter the operating system, thereby creating a truly seamless and secure login experience.
As we gather user feedback, analyse usage data, and delve into Passkey's impact, we aim to identify growth opportunities and further enhance our understanding of this innovative feature's transformative effect on app security. Stay tuned for updates on how we are revolutionising our approach to authentication, with a continuous focus on enhancing user convenience and security.

## References

- [Consumer Password and Passkey Trends: World Password Day 2024 - FIDO Alliance.](https://fidoalliance.org/content-ebook-consumer-password-and-passkey-trends-wpd-2024/#:~:text=To%20commemorate%20World%20Password%20Day,attitudes%20towards%20authentication%20are%20evolving)
- [Libraries - passkeys.dev](https://passkeys.dev/docs/tools-libraries/libraries/)
- [Web Authentication: An API for accessing Public Key Credentials - Level 2](https://www.w3.org/TR/webauthn/)
- [Quick overview of WebAuthn FIDO2 and CTAP](https://developers.yubico.com/Passkeys/Quick_overview_of_WebAuthn_FIDO2_and_CTAP.html)

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 700 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!