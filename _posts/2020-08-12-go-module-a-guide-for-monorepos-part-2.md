---
layout: post
id: 2020-05-29-go-module-a-guide-for-monorepos-part-2
title: Go Modules- A guide for monorepos (Part 2)
date: 2020-08-12 10:02:00
authors: [michael-cartmell]
categories: [Engineering]
tags: [go, monorepo, vendoring, vendors, libraries]
comments: true
cover_photo: /img/go-module-a-guide-for-monorepos-part-1/cover.png
excerpt: "This is the second post on the Go module series, which highlights Grab’s experience working with Go modules in a multi-module monorepo. Here, we discuss the additional solutions for addressing dependency issues, as well as cover automatic upgrades."
---

This is the second post on the Go module series, which highlights Grab’s experience working with Go modules in a multi-module monorepo. In this article, we’ll focus on suggested solutions for catching unexpected changes to the `go.mod` file and addressing dependency issues. We’ll also cover automatic upgrades and other learnings uncovered from the initial obstacles in using Go modules.

## Vendoring process issues

Our previous vendoring process fell solely on the developer who wanted to add or update a dependency. However, it was often the case that the developer came across many unexpected changes, due to previous vendoring attempts, accidental imports and changes to dependencies.

The developer would then have to resolve these issues before being able to make a change, costing time and causing frustration with the process. It became clear that it wasn’t practical to expect the developer to catch all of the potential issues while vendoring, especially since Go modules itself was new and still in development.

## Avoiding unexpected changes

Reluctantly, we added a check to our CI process which ran on every merge request. This helped ensure that there are no unexpected changes required to go mod. This added time to every build and often flagged a failure, but it saved a lot of post-merge hassle. We then realized that we should have done this from the beginning.

Since we hadn’t enabled Go modules for builds yet, we couldn’t rely on the [`\mod=readonly`](https://godoc.org/cmd/go%23hdr-Maintaining_module_requirements) flag. We implemented the check by running `go mod vendor` and then checking the resulting difference.

If there were any changes to `go.mod` or the vendor directory, the merge request would get rejected. This worked well in ensuring the integrity of our `go.mod`.

## Roadblocks and learnings

However, as this was the first time we were using Go modules on our CI system, it uncovered some more problems.

### Private repository access

There was the problem of accessing private repositories. We had to ensure that the CI system was able to clone all of our private repositories as well as the main monorepo, by adding the relevant SSH deploy keys to the repository.

### False positives

The check sometimes fired `false positives` - detecting a go mod failure when there were no changes. This was often due to network issues, especially when the modules are hosted by less reliable third-party servers. This is somewhat solved in Go 1.13 onwards with the introduction of [proxy servers](https://golang.org/cmd/go/%23hdr-Module_downloading_and_verification), but our workaround was simply to retry the command several times.

We also avoided adding dependencies hosted by a domain that we haven’t seen before, unless absolutely necessary.

### Inconsistent Go versions

We found several inconsistencies between Go versions - running go mod vendor on one Go version gave different results to another. One example was a [change to the checksums](https://github.com/golang/go/issues/29278). These inconsistencies are less common now, but still remain between Go 1.12 and later versions. The only solution is to stick to a single version when running the vendoring process.

## Automated upgrades


There are benefits to using Go modules for vendoring. It’s faster than previous solutions, better supported by the community and it’s part of the language, so it doesn’t require any extra tools or wrappers to use it.

One of the most useful benefits from using Go modules is that it enables automated upgrades of dependencies in the go.mod file - and it becomes more useful as more third-party modules adopt Go modules and semantic versioning.

<div class="post-image-section"><figure>
  <img src="/img/go-module-a-guide-for-monorepos-part-2/image1.png" alt="Automated updates workflow">
  <figcaption align="middle"><i>Automated updates workflow</i></figcaption>
</figure></div>

We call our solution for automating updates at Grab the AutoVend Bot. It is built around a single Go command, `go list -m -u all`, which finds and lists available updates to the dependencies listed in `go.mod` (add `\json` for JSON output). We integrated the bot with our development workflow and change-request system to take the output from this command and create merge requests automatically, one per update.

Once the merge request is approved (by a human, after verifying the test results), the bot would push the change. We have hundreds of dependencies in our main monorepo module, so we’ve scheduled it to run a small number each day so we’re not overwhelmed.

By reducing the manual effort required to update dependencies to almost nothing, we have been able to apply hundreds of updates to our dependencies, and ensure our most critical dependencies are on the latest version. This not only helps keep our dependencies free from bugs and security flaws, but it makes future updates far easier and less impactful by reducing the set of changes needed.

## In Summary

Using Go modules for vendoring has given us valuable and low-risk exposure to the feature. We have been able to detect and solve issues early, without affecting our regular builds, and develop tooling that’ll help us in future.

Although Go modules is part of the standard Go toolchain, it shouldn’t be viewed as a complete _off the shelf_ solution that can be dropped into a codebase, especially a monorepo.

Like many other Go tools, the Modules feature comprises many small, focused tools that work best when combined together with other code. By embracing this concept and leveraging things like go list, go mod graph and go mod vendor, Go modules can be made to integrate into existing workflows, and deliver the benefits of structured versioning and reproducible builds.

I hope you have enjoyed this article on using Go modules and vendoring within a monorepo.

## Join us
Grab is more than just the leading ride-hailing and mobile payments platform in Southeast Asia. We use data and technology to improve everything from transportation to payments and financial services across a region of more than 620 million people. We aspire to unlock the true potential of Southeast Asia and look for like-minded individuals to join us on this ride.

If you share our vision of driving South East Asia forward, [apply](https://grab.careers/jobs/) to join our team today.

#### Credits
*The cute Go gopher logo for this blog's cover image was inspired by Renee French's original work.*
