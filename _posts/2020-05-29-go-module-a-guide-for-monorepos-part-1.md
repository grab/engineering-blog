---
layout: post
id: 2020-05-29-go-module-a-guide-for-monorepos-part-1
title: Go Modules- A Guide for monorepos (Part 1)
date: 2020-05-29 11:34:40
authors: [michael-cartmell]
categories: [Engineering]
tags: [Go, Monorepo, Vendoring, Vendors, Libraries]
comments: true
cover_photo: /img/go-module-a-guide-for-monorepos-part-1/cover.png
excerpt: "This post is the first in a series of blogs about Grab’s experience with Go modules in a multi-module monorepo. Here, we discuss the challenges we faced along the way and the solutions we came up with."
---

[Go modules](https://github.com/golang/go/wiki/Modules%23quick-start) are a new feature in Go for versioning packages and managing dependencies. It has been almost 2 years in the making, and it’s finally production-ready in the Go 1.14 release early this year. Go recommends using single-module repositories by default, and warns that multi-module repositories require great care.

At Grab, we have a large monorepo and changing from our existing monorepo structure has been an interesting and humbling adventure. We faced serious obstacles to fully adopting Go modules. This series of articles describes Grab’s experience working with Go modules in a multi-module monorepo, the challenges we faced along the way, and the solutions we came up with.

To fully appreciate Grab’s journey in using Go Modules, it’s important to learn about the beginning of our vendoring process.

## Native Support for Vendoring Using the Vendor Folder

With Go 1.5 came the concept of the `vendor` folder, a new package discovery method, providing native support for vendoring in Go for the first time.

With the `vendor` folder, projects influenced the lookup path simply by copying packages into a `vendor` folder nested at the project root. Go uses these packages before traversing the `GOPATH` root, which allows a monorepo structure to vendor packages within the same repo as if they were 3rd-party libraries. This enabled `go build` to work consistently without any need for extra scripts or env var modifications.

### Initial Obstacles

There was no official command for managing the `vendor` folder, and even copying the files in the `vendor` folder manually was common.

At Grab, different teams took different approaches. This meant that we had multiple version manifests and lock files for our monorepo’s vendor folder. It worked fine as long as there were no conflicts. At this time very few 3rd-party libraries were using proper tagging and semantic versioning, so it was worse because the lock files were largely a jumble of commit hashes and timestamps.

<div class="post-image-section"><figure>
  <img src="/img/go-module-a-guide-for-monorepos-part-1/image2.png" alt="Jumbled commit hashes and timestamps">
  <figcaption align="middle"><i>Jumbled commit hashes and timestamps</i></figcaption>
</figure></div>


As a result of the multiple versions and lock files, the vendor directory was not reproducible, and we couldn’t be sure what versions we had in there.

### Temporary Relief

We eventually settled on using [Glide](https://github.com/Masterminds/glide), and standardised our vendoring process. Glide gave us a reproducible, verifiable `vendor` folder for our dependencies, which worked up until we switched to Go modules.

## Vendoring Using Go Modules

I first heard about Go modules from Russ Cox’s talk at [GopherCon Singapore](https://2018.gophercon.sg) in 2018, and soon after started working on adopting modules at Grab, which was to manage our existing `vendor` folder.

This allowed us to align with the official Go toolchain and familiarise ourselves with Go modules while the feature matured.

### Switching to Go Modules

Go modules introduced a `go mod vendor` command for exporting all dependencies from `go.mod` into `vendor`. We didn’t plan to enable Go modules for builds at this point, so our builds continued to run exactly as before, indifferent to the fact that the vendor directory was created using `go mod`.

The initial task to switch to `go mod vendor` was relatively straightforward as listed here:

1.  Generated a `go.mod` file from our `glide.yaml` dependencies. This was scripted so it could be kept up to date without manual effort.
2.  Replaced the vendor directory.
3.  Committed the changes.
4.  Used `go mod` instead of glide to manage the vendor folder.

The change was extremely large (due to differences in how glide and `go mod` handled the pruning of unused code), but equivalent in terms of Go code. However, there were some additional changes needed besides porting the version file.

### Addressing Incompatible Dependencies

Some of our dependencies were not yet compatible with Go modules, so we had to use Go module’s replace directive to substitute them with a working version.

A more complex issue was that parts of our codebase relied on nested vendor directories, and had dependencies that were incompatible with the top level. The `go mod vendor` command attempts to include all code nested under the root path, whether or not they have used a sub-vendor directory, so this led to conflicts.

#### Problematic Paths

Rather than resolving all the incompatibilities, which would’ve been a major undertaking in the monorepo, we decided to exclude these paths from Go modules instead. This was accomplished by [placing an empty go.mod file](https://github.com/golang/go/wiki/Modules%23can-an-additional-gomod-exclude-unnecessary-content-do-modules-have-the-equivalent-of-a-gitignore-file) in the problematic paths.

#### Nested Modules

The empty `go.mod` file worked. This brought us to an important rule of Go modules, which is central to understanding many of the issues we encountered:

<div>
 <p align="middle"><b><i>A module cannot contain other modules</i></b>
</p></div>

This means that although the modules are within the same repository, Go modules treat them as though they are completely independent. When running `go mod` commands in the root of the monorepo, Go doesn’t even ‘see’ the other modules nested within.

### Tackling Maintenance Issues

After completing the initial migration of our vendor directory to go mod vendor however, it opened up a different set of problems related to maintenance.

With Glide, we could guarantee that the Glide files and vendor directory would not change unless we deliberately changed them. This was not the case after switching to Go modules; we found that the `go.mod` file frequently required unexpected changes to keep our vendor directory reproducible.

There are two frequent cases that cause the `go.mod` file to need updates: _dependency inheritance_ and _implicit updates_.

#### Dependency Inheritance

Dependency inheritance is a consequence of Go modules [version selection](https://github.com/golang/go/wiki/Modules%23is-gosum-a-lock-file-why-does-gosum-include-information-for-module-versions-i-am-no-longer-using). If one of the monorepo’s dependencies uses Go modules, then the monorepo inherits those version requirements as well.

When starting a new module, the default is to use the latest version of dependencies. This was an issue for us as some of our monorepo dependencies had not been updated for some time. As engineers wanted to import their module from the monorepo, it caused `go mod vendor` to pull in a huge amount of updates.

To solve this issue, we wrote a quick script to copy the dependency versions from one module to another.

One key learning here is to have other modules use the monorepo’s versions, and if any updates are needed then the monorepo should be updated first.

#### Implicit Updates

Implicit updates are a more subtle problem. The typical Go modules [workflow](https://github.com/golang/go/wiki/Modules%23daily-workflow) is to use standard Go commands: `go build`, `go test`, and so on, and they will automatically update the `go.mod` file as needed. However, this was sometimes surprising, and it wasn’t always clear why the `go.mod` file was being updated. Some of the reasons we found were:

*   A new import was added by mistake, causing the dependency to be added to the `go.mod` file
*   There is a [local replace](https://github.com/golang/go/wiki/Modules%23when-should-i-use-the-replace-directive) for some module B, and B changes its own `go.mod`. When there’s a local replace, it bypasses versioning, so the changes to B’s go.mod are immediately inherited.
*   The build imports a package from a dependency that can’t be satisfied with the current version, so Go attempts to update it.

This means that simply _creating_ a tag in an external repository is sometimes enough to affect the `go.mod` file, if you already have a broken import in the codebase.

### Resolving Unexpected Dependencies Using Graphs

To investigate the unexpected dependencies, the command `go mod graph` proved the most useful.

Running `graph` with good old grep was good enough, but its output is also compatible with the [digraph tool](https://godoc.org/golang.org/x/tools/cmd/digraph) for more sophisticated queries. For example, we could use the following command to trace the source of a dependency on `cloud.google.com/go`:

```
$ go mod graph | digraph somepath grab.com/example cloud.google.com/go@v0.26.0

github.com/hashicorp/vault/api@v1.0.4 github.com/hashicorp/vault/sdk@v0.1.13

github.com/hashicorp/vault/sdk@v0.1.13 google.golang.org/genproto@v0.0.0-20190404172233-64821d5d2107

google.golang.org/genproto@v0.0.0-20190404172233-64821d5d2107 google.golang.org/grpc@v1.19.0

google.golang.org/grpc@v1.19.0 cloud.google.com/go@v0.26.0
```

<div class="post-image-section"><figure>
  <img src="/img/go-module-a-guide-for-monorepos-part-1/image1.png" alt="Diagram generated using modgraphviz">
  <figcaption align="middle"><i>Diagram generated using modgraphviz</i></figcaption>
</figure></div>


## Stay Tuned for More
I hope you have enjoyed this article. In our next post, we’ll cover the other solutions we have for catching unexpected changes to the `go.mod` file and addressing dependency issues.


## Join Us

Grab is a leading superapp in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across over 400 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today! in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!

#### Credits
*The cute Go gopher logo for this blog's cover image was inspired by Renee French's original work.*
