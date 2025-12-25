---
layout: post
id: 2021-07-29-grabfood-bundle-size
title: How We Cut GrabFood.com’s Page JavaScript Asset Sizes by 3x
date: 2021-07-29 01:20:00
authors: [gibson-cheng]
categories: [Product]
tags: [Product, Asset Size, Cloud, Optimisation]
comments: true
cover_photo: /img/grabfood-bundle/image11.png
excerpt: "Find out how the GrabFood team cut their bundle size by 3 times with these 7 webpack bundle optimisation strategies."
---

## Introduction
Every week, GrabFood.com's cloud infrastructure serves over >1TB network egress and 175 million requests, which increased our costs. To minimise cloud costs, we had to look at optimising (and reducing) GrabFood.com’s bundle size.

Any reduction in bundle size helps with:

*   Faster site loads! (especially for locations with lower mobile broadband speeds)
*   Cost savings for users: Less data required for each site load
*   Cost savings for Grab: Less network egress required to serve users
*   Faster build times: Fewer dependencies -> less code for webpack to bundle -> faster builds
*   Smaller builds: Fewer dependencies -> less code -> smaller builds

After applying the 7 webpack bundle optimisations, we were able to yield the following improvements:

*   7% faster page load time from 2600ms to 2400ms
*   66% faster JS static asset load time from 180ms to 60ms
*   3x smaller JS static assets from 750KB to 250KB
*   1.5x less network egress from 1800GB to 1200GB
*   20% less for CloudFront costs from $1750 to $1400
*   1.4x smaller bundle from 40MB to 27MB
*   3.6x faster build time from ~2000s to ~550s

## Solution

One of the biggest factors influencing bundle size is dependencies. As mentioned earlier, fewer dependencies mean fewer lines of code to compile, which result in a smaller bundle size. Thus, to optimise GrabFood.com’s bundle size, we had to look into our dependencies.

Tldr;

Jump to [Step C: Reducing your Dependencies](#step-c-reducing-your-dependencies) to see the 7 strategies we used to cut down our bundle size.

### Step A: Identify Your Dependencies

In this step, we need to ask ourselves 'what are our largest dependencies?'. We used the [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer) to inspect GrabFood.com’s bundles. This gave us an overview of all our dependencies and we could easily see which bundle assets were the largest.

<div class="post-image-section"><figure>
  <img src="/img/grabfood-bundle/image12.png" alt="Our grabfood.com bundle analyzer output" style="width:90%"> <figcaption align="middle"><i>Our grabfood.com bundle analyzer output</i></figcaption>
  </figure>
</div>

*   For Next.js, you should use [@next/bundle-analyze](https://github.com/vercel/next.js/tree/canary/packages/next-bundle-analyzer) instead.
*   Bundle analysis output allows us to easily inspect what’s in our bundle.

What to look out for:

I: Large dependencies (fairly obvious, because the box size will be large)

![](img/grabfood-bundle/image4.png)

II: Duplicate dependencies (same library that is bundled multiple times across different assets)

![](img/grabfood-bundle/image2.png)

III: Dependencies that look like they don’t belong (e.g. Why is ‘elliptic’ in my frontend bundle?)

![](img/grabfood-bundle/image8.png)

What to avoid:

* Isolating dependencies that are very small (e.g. <20kb). Not worth focusing on this due to very meagre returns.
    * E.g. Business logic like your React code
    * E.g. Small node dependencies

### Step B: Investigate the Usage of Your Dependencies (Where are my Dependencies Used?)

<div class="post-image-section"><figure>
  <img src="/img/grabfood-bundle/image10.png" alt="Our grabfood.com bundle analyzer output" style="width:90%"> <a href="https://pixabay.com/photos/architecture-building-geometric-1868547/"><figcaption align="middle"><i>Image source</i></figcaption></a>
  </figure>
</div>

In this step, we are trying to answer this question: “Given a dependency, which files and features are making use of it?”.

There are two broad approaches that can be used to identify how our dependencies are used:

I: Top-down approach: “Where does our project use dependency X?”

*   Conceptually identify which feature(s) requires the use of dependency X.
*   E.g. Given that we have ‘[jwt-simple](https://github.com/hokaccha/node-jwt-simple)’ as a dependency, which set of features in my project requires JWT encoding/decoding?

II: Bottom-up approach: “How did dependency X get used in my project?”

*   Trace dependencies by manually tracing `import()` and `require()` statements
*   Alternatively, use dependency visualisation tools such as [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) to identify file interdependencies. Note that output can quickly get noisy for any non-trivial project, so use it for inspecting small groups of files (e.g. single domains).

Our recommendation is to use a **mix** of both Top-down and Bottom-up approaches to identify and isolate dependencies.

Dos:

*   Be methodical when tracing dependencies: Use a document to track your progress as you manually trace inter-file dependencies.
*   Use dependency visualisation tools like [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) to quickly view a given file’s dependencies.
*   Consult Dr. Google if you get stuck somewhere, especially if the dependencies are buried deep in a dependency tree i.e. non-1st-degree dependencies (e.g. “[Why webpack includes elliptic bn.js modules in bundle](https://stackoverflow.com/questions/42492410/why-webpack-includes-elliptic-bn-js-modules-in-my-bundle)”)

Don’ts:

*   Stick to a single approach - Know when to switch between Top-down and Bottom-up approaches to narrow down the search space.

### Step C: Reducing Your Dependencies

<div class="post-image-section"><figure>
  <img src="/img/grabfood-bundle/image15.gif" alt="Our grabfood.com bundle analyzer output" style="width:90%"> <a href="https://i.imgur.com/w8Ydzvb.gif"><figcaption align="middle"><i>Image source</i></figcaption></a>
  </figure>
</div>

Now that you know what your largest dependencies are and where they are used, the next step is figuring out how you can shrink your dependencies.

Here are 7 strategies that you can use to reduce your dependencies:

1.  [Lazy load large dependencies and less-used dependencies](#1-lazy-load-large-dependencies-and-less-used-dependencies)
2.  [Unify instances of duplicate modules](#2-unify-instances-of-duplicate-modules)
3.  [Use libraries that are exported in ES Modules format](#3-use-libraries-that-are-exported-in-es-modules-format)
4.  [Replace libraries whose features are already available on the Browser Web API](#4-replace-libraries-whose-features-are-already-available-on-the-browser-web-api)
5.  [Avoid large dependencies by changing your technical approach](#5-avoid-large-dependencies-by-changing-your-technical-approach)
6.  [Avoid using node dependencies or libraries that require node dependencies](#6-avoid-using-node-dependencies-or-libraries-that-require-node-dependencies)
7.  [Optimise your external dependencies](#7-optimise-your-external-dependencies)

Note: These strategies have been listed in ascending order of difficulty - focus on the easy wins first 🙂

#### 1. Lazy Load Large Dependencies and Less-used Dependencies

<div class="post-image-section"><figure>
  <img src="/img/grabfood-bundle/image13.png" alt="When a file adds +2MB worth of dependencies" style="width:90%"> <figcaption align="middle"><i>“When a file adds +2MB worth of dependencies”, <a href="https://knowyourmeme.com/memes/vault-boy-hold-up">Image source</a></i></figcaption>
  </figure>
</div>

Similar to how lazy loading is used to break down large React pages to improve page performance, we can also lazy load libraries that are rarely used, or are not immediately used until prior to certain user actions.

Before:

```javascript

const crypto = require(‘crypto’)

const computeHash = (value, secret) => {

 return crypto.createHmac(value, secret)

}

```

After:

```javascript

const computeHash = async (value, secret) => {

 const crypto = await import(‘crypto’)

 return crypto.createHmac(value, secret)

}

```

Example:

*   Scenario: Use of Anti-abuse library prior to sensitive API calls
*   Action: Instead of bundling the anti-abuse library together with the main page asset, we opted to lazy load the library only when we needed to use it (i.e. load the library just before making certain sensitive API calls).
*   Results: Saved 400KB on the main page asset.

Notes:

*   Any form of lazy loading will incur some latency on the user, since the asset must be loaded with [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

#### 2. Unify Instances of Duplicate Modules

<div class="post-image-section"><figure>
  <img src="/img/grabfood-bundle/image6.png" alt="" style="width:90%"> <figcaption align="middle"><i><a href="https://knowyourmeme.com/memes/spider-man-pointing-at-spider-man">Image source</a></i></figcaption>
  </figure>
</div>

If you see the same dependency appearing in multiple assets, consider unifying these duplicate dependencies under a single entrypoint.

Before:

```javascript

// ComponentOne.jsx

import GrabMaps from ‘grab-maps’

// ComponentTwo.jsx

import GrabMaps, { Marker } from ‘grab-maps’

```

After:

```javascript

// grabMapsImportFn.js

const grabMapsImportFn = () => import(‘grab-maps’)

// ComponentOne.tsx

const grabMaps = await grabMapsImportFn()

const GrabMaps = grabMaps.default

// ComponentTwo.tsx

const grabMaps = await grabMapsImportFn()

const GrabMaps = grabMaps.default

const Marker = grabMaps.Marker

```

Example:

*   Scenario: Duplicate ‘grab-maps’ dependencies in bundle
*   Action: We observed that we were bundling the same ‘grab-maps’ dependency in 4 different assets so we refactored the application to use a single entrypoint, ensuring that we only bundled one instance of ‘grab-maps’.
*   Results: Saved 2MB on total bundle size.

Notes:

*   Alternative approach: Manually define a new cacheGroup to target a specific module ([see more](https://webpack.js.org/plugins/split-chunks-plugin/%23split-chunks-example-2)) with ‘enforce:true’, in order to force webpack to always create a separate chunk for the module. Useful for cases where the single dependency is very large (i.e. >100KB), or when asynchronously loading a module isn’t an option.
*   Certain libraries that appear in multiple assets (e.g. antd) should not be mistaken as identical dependencies. You can verify this by inspecting each module with one another. If the contents are different, then webpack has already done its job of tree-shaking the dependency and only importing code used by our code.
*   Webpack relies on the `import()` statement to identify that a given module is to be explicitly bundled as a separate chunk ([see more](https://webpack.js.org/api/module-methods/%23import-1)).

#### 3. Use Libraries that are Exported in ES Modules Format

<div class="post-image-section"><figure><img src="/img/grabfood-bundle/image1.gif" alt="Did you say ‘tree-shaking’?" style="width:90%"><figcaption align="middle"><i>“Did you say ‘tree-shaking’?”, <a href="https://www.huffpost.com/entry/commercial-harvesting_n_57a215eee4b04414d1f2df60">Image source</a></i></figcaption>
  </figure>
</div>

*   If a given library has a variant with an ES Module distribution, use that variant instead.
*   ES Modules allows webpack to perform [](https://webpack.js.org/guides/tree-shaking/) [tree-shaking](https://webpack.js.org/guides/tree-shaking/) automatically, allowing you to save on your bundle size because unused library code is not bundled.
*   Use [](https://bundlephobia.com/) [bundlephobia](https://bundlephobia.com/) to quickly ascertain if a given library is tree-shakeable (e.g. ‘[lodash-es](https://bundlephobia.com/package/lodash-es@4.17.21)' vs [](https://bundlephobia.com/package/lodash@4.17.21) [‘lodash](https://bundlephobia.com/package/lodash@4.17.21)’)

Before:

```javascript

import { get } from ‘lodash’

```

After:

```javascript

import { get } from ‘lodash-es’

```

Example:

*   Use Case: Using Lodash utilities
*   Action: Instead of using the standard ‘lodash’ library, you can swap it out with ‘lodash-es’, which is bundled using ES Modules and is functionally equivalent.
*   Results: Saved 0KB - We were already directly importing individual Lodash functions (e.g. ‘lodash/get’), therefore importing only the code we need. Still, ES Modules is a more convenient way to go about this 👍.

Notes:

*   Alternative approach: Use babel plugins (e.g. ‘[babel-plugin-transform-imports](https://www.npmjs.com/package/babel-plugin-transform-imports)’) to transform your import statements at build time to selectively import specific code for a given library.

#### 4. Replace Libraries whose Features are Already Available on the Browser Web API

<div class="post-image-section"><figure><img src="/img/grabfood-bundle/image3.png" alt="When you replace axios with fetch" style="width:90%"><figcaption align="middle"><i>“When you replace axios with fetch”, <a href="https://knowyourmeme.com/memes/the-future-is-now-old-man">Image source</a></i></figcaption>
  </figure>
</div>

If you are relying on libraries for functionality that is available on the [Web API](https://developer.mozilla.org/en-US/docs/Web/API), you should revise your implementation to leverage on the Web API, allowing you to skip certain libraries when bundling, thus saving on bundle size.

Before:

```javascript

import axios from ‘axios’

const getEndpointData = async () => {

 const response = await axios.get(‘/some-endpoint’)

 return response

}

```

After:

```javascript

const getEndpointData = async () => {

 const response = await fetch(‘/some-endpoint’)

 return response

}
```

Example:

*   Use Case: Replacing axios with `fetch()` in the anti-abuse library
*   Action: We observed that our anti-abuse library was relying on axios to make web requests. Since our web app is only targeting modern browsers - most of which support `fetch()` (with the notable exception of IE) - we refactored the library’s code to use `fetch()` exclusively.
*   Results: Saved 15KB on anti-abuse library size.

#### 5. Avoid Large Dependencies by Changing your Technical Approach

<div class="post-image-section"><figure><img src="/img/grabfood-bundle/image16.png" alt="" style="width:90%"><figcaption align="middle"><i><a href="https://knowyourmeme.com/memes/this-is-brilliant-but-i-like-this">Image source</a></i></figcaption>
  </figure>
</div>

If it is acceptable to change your technical approach, we can avoid using certain dependencies altogether.

Before:

```javascript

import jwt from ‘jwt-simple’

const encodeCookieData = (data) => {

 const result = jwt.encode(data, ‘some-secret’)

 return result

}

```

After:

```javascript

const encodeCookieData = (data) => {

 const result = JSON.stringify(data)

 return result

}

```

Example:

*   Scenario: Encoding for browser cookie persistence
*   Action: As we needed to store certain user preferences in the user’s browser, we previously opted to use JWT encoding; this involved signing JWTs on the client side, which has a hard dependency on ‘crypto’. We revised the implementation to use plain JSON encoding instead, removing the need for ‘crypto’.
*   Results: Saved 250KB per page asset, 13MB in total bundle size.

#### 6. Avoid Using Node Dependencies or Libraries that Require Node Dependencies

<div class="post-image-section"><figure><img src="/img/grabfood-bundle/image7.png" alt="“When someone does require(‘crypto’)”" style="width:90%"><figcaption align="middle"><i>“When someone does require(‘crypto’)”, <a href="https://www.memecreator.org/meme/yamero0/">Image source</a></i></figcaption>
  </figure>
</div>

You should not need to use node-related dependencies, unless your application relies on a node dependency directly or indirectly.

Examples of node dependencies: ‘Buffer’, ‘crypto’, ‘https’ ([see more](https://nodejs.org/docs/latest-v16.x/api/))

Before:

```javascript

import jwt from ‘jsonwebtoken’

const decodeJwt = async (value) => {

 const result = await new Promise((resolve) => {

 jwt.verify(token, 'some-secret', (err, decoded) => resolve(decoded))

 })

 return result

}

```

After:

```javascript

import jwt_decode from ‘jwt-decode’

const decodeJwt = (value) => {

 const result = jwt_decode(value)

 return result

}

```

Example:

*   Scenario: Decoding JWTs on the client side
*   Action: In terms of JWT usage on the client side, we only need to decode JWTs - we do not need any logic related to encoding JWTs. Therefore, we can opt to use libraries that perform just decoding (e.g. ‘[jwt-decode](https://github.com/auth0/jwt-decode)’) instead of libraries (e.g. ‘[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)’) that performs the full suite of JWT-related operations (e.g. signing, verifying).
*   Results: Same as in Point 5: Example. (i.e. no need to decode JWTs anymore, since we aren’t using JWT encoding for browser cookie persistence)

#### 7. Optimise your External Dependencies

<div class="post-image-section"><figure><img src="/img/grabfood-bundle/image14.png" alt="“Team: Can you reduce the bundle size further? You:“" style="width:90%"><figcaption align="middle"><i>“Team: Can you reduce the bundle size further? You: (nervous grin)“, <a href="https://awesomebyte.com/viral-face-of-the-internet-the-origin-of-hide-the-pain-harold/">Image source</a></i></figcaption>
  </figure>
</div>

We can do a deep-dive into our dependencies to identify possible size optimisations by applying all the aforementioned techniques. If your size optimisation changes get accepted, regardless of whether it’s publicly (e.g. GitHub) or privately hosted (own company library), it’s a win-win for everybody! 🥳

Example:

*   Scenario: Creating custom ‘node-forge’ builds for our Anti-abuse library
*   Action: Our Anti-abuse library only uses certain features of ‘node-forge’. Thankfully, the ‘node-forge’ maintainers have provided an easy way to make custom builds that only bundle selective features ([see more](https://github.com/digitalbazaar/forge/blob/c666282c812d6dc18e97b419b152dd6ad98c802c/webpack.config.js%23L15-L61)).
*   Results: Saved 85KB in Anti-abuse library size and reduced bundle size for all other dependent projects.

### Step D: Verify that You have Modified the Dependencies

<div class="post-image-section"><figure><img src="/img/grabfood-bundle/image9.png" alt="Now… where did I put that needle?" style="width:90%"><figcaption align="middle"><i>“Now… where did I put that needle?”, <a href="https://pixabay.com/photos/haystack-bale-of-straw-fields-hay-401882/">Image source</a></i></figcaption>
  </figure>
</div>

So, you’ve found some opportunities for major bundle size savings, that’s great!

But as always, it’s best to be methodical to measure the impact of your changes, and to make sure no features have been broken.

1.  Perform your code changes
2.  Build the project again and open the bundle analysis report
3.  Verify the state of a given dependency
    *   **Deleted dependency** - you should not be able to find the dependency
    *   **Lazy-loaded dependency** - you should see the dependency bundled as a separate chunk
    *   **Non-duplicated dependency** - you should only see a single chunk for the non-duplicated dependency
4.  Run tests to make sure you didn’t break anything (i.e. unit tests, manual tests)

### Other Considerations

*Preventive Measures*

*   Periodically monitor your bundle size to identify increases in bundle size
*   Periodically monitor your site load times to identify increases in site load times

*Webpack Configuration Options*

1. Disable bundling node modules with ‘node: false’
    *   Only if your project doesn’t already include libraries that rely on node modules.
    *   Allows for fast detection when someone tries to use a library that requires node modules, as the build will fail
2. Experiment with ‘cacheGroups’
    *   Most default configurations of webpack do a pretty good job of identifying and bundling the most commonly used dependencies into a single chunk (usually called vendor.js)
    *   You can experiment with webpack [](https://webpack.js.org/plugins/split-chunks-plugin/) [optimisation options](https://webpack.js.org/plugins/split-chunks-plugin) to see if you get better results
3. Experiment with `import()` ‘Magic Comments’
    *   You may experiment with [import() magic comments](https://webpack.js.org/api/module-methods/%23magic-comments) to modify the behaviour of specific `import()` statements, although the default setting will do just fine for most cases.

If you can’t remove the dependency:
*   For all dependencies that must be used, it’s probably best to lazy load all of them so you won’t block the page’s initial rendering ([see more](https://web.dev/first-contentful-paint/)).

* * *

Conclusion
==========

<div class="post-image-section"><figure><img src="/img/grabfood-bundle/image5.png" alt="" style="width:90%"><figcaption align="middle"><i><a href="https://pixabay.com/photos/zen-meditation-yoga-spirituality-5533537/">Image source</a></i></figcaption>
  </figure>
</div>

To summarise, here’s how you can go about this business of reducing your bundle size.

Namely...

1.  Identify Your Dependencies
2.  Investigate the Usage of Your Dependencies
3.  Reduce Your Dependencies
4.  Verify that You have Modified the Dependencies

And by using these 7 strategies...

1.  Lazy load large dependencies and less-used dependencies
2.  Unify instance of duplicate modules
3.  Use libraries that are exported in ES Modules format
4.  Replace libraries whose features are already available on the Browser Web API
5.  Avoid large dependencies by changing your technical approach
6.  Avoid using node dependencies
7.  Optimise your external dependencies

You can have...

*   Faster page load time (smaller individual pages)
*   Smaller bundle (fewer dependencies)
*   Lower network egress costs (smaller assets)
*   Faster builds (fewer dependencies to handle)

Now armed with this information, may your eyes be keen, your bundles be lean, your sites be fast, and your cloud costs be low! 🚀 ✌️

---

<small class="credits">Special thanks to Han Wu, Melvin Lee, Yanye Li, and Shujuan Cheong for proofreading this article. 🙂</small>

---

## Join us

Grab is a leading superapp in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across over 400 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
