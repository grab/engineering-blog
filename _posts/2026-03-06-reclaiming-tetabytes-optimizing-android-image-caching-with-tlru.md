---
layout: post
id: 2026-03-06-reclaiming-tetabytes-optimizing-android-image-caching-with-tlru
title: 'Reclaiming Terabytes: Optimizing Android image caching with TLRU'
date: 2026-03-06 00:23:00
authors: [van.minh]
categories: [Engineering]
tags: [app disk, disk size, optimization, scalability] 
comments: true
cover_photo: /img/image-caching/banner-image.png
excerpt: "In the quest to optimize app performance, managing the image cache was crucial. This blog takes us on a journey from a traditional Least Recently Used (LRU) cache to a Time-Aware Least Recently Used (TLRU) cache. This innovative approach reclaimed terabytes of storage across millions of devices while maintaining user experience and controlling server costs. Discover how Grab's TLRU implementation cleverly balances storage optimization and performance, offering a glimpse into the future of app development."
---

## Introduction

In a previous post, we discussed [Project Bonsai](https://engineering.grab.com/project-bonsai), our initiative to reduce the Grab app's download size. We successfully reduced the Android Application Package (APK) download size by 26%. This reduction offers a substantial advantage: it minimizes download friction, allowing users to download the app, even on slower networks. However, the battle for storage doesn't end after installation.

The Grab app includes a wide range of features and workflows that heavily depend on image content, particularly in services like transportation and e-commerce. Although some images are packaged within the app binary, a large majority are downloaded from Grab’s server at runtime. To optimize the app's performance and minimize server expenses, the downloaded images are cached in the app's storage. This reduces both load times and traffic to Grab's image server, resulting in better user experience and lower costs. Although we use Least Recently Used (LRU) cache to manage storage, many images can remain in the app storage for extended periods, even if they are no longer relevant.

This blog details how we addressed this challenge in our Grab Android app by evolving our standard LRU cache into a **Time-Aware Least Recently Used (TLRU)** cache. This evolution allows us to reclaim storage space without compromising user experience or increasing server costs.

## Understanding LRU cache limitations

*Note: In this article, when "cache" or "image cache" is mentioned, it specifically refers to **disk cache**, which is the persistent storage on the device's file system, rather than in-memory cache.*

The Grab Android app uses the [Glide library](https://github.com/bumptech/glide) as its primary image loading framework. Glide provides excellent features for efficient image loading, caching, and display. At its core, by default, Glide uses a cloned version of [Jake Wharton's DiskLruCache](https://github.com/bumptech/glide/blob/master/third_party/disklrucache/src/main/java/com/bumptech/glide/disklrucache/DiskLruCache.java) for disk-based caching.

To prevent unlimited cache growth, we configured the LRU cache with a maximum size limit of 100 MB. However, our analytics revealed that the 90th percentile (P90) of users were consistently reaching this 100 MB limit, meaning the cache was constantly at capacity. Conversely, for users whose cache hadn't yet reached the 100 MB threshold, images were never removed, even if they were outdated by several months and no longer relevant.

Our analysis revealed that image caching was a major contributor to the app's disk footprint, and without proactive management, this would only worsen as we continued adding features and content to Grab’s superapp.

### How DiskLruCache works

The LRU cache algorithm manages storage by maintaining entries in access order and automatically evicting the oldest unused entries when space is needed.

**Figure 1 and 2** illustrates how LRU cache trimming works. These diagrams present an LRU cache with a maximum size of 100 MB containing three cache entries totaling 95 MB. When a new 25 MB cache entry is added, it exceeds the cache's maximum size.

<div class="post-image-section"><figure>
  <img src="/img/image-caching/figure-1.png" alt="" style="width:60%"><figcaption align="middle">Figure 1. A new cache entry is added to an LRU cache that's near its 100 MB capacity, exceeding the limit.</figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/image-caching/figure-2.png" alt="" style="width:60%"><figcaption align="middle">Figure 2. The LRU cache automatically trims the least recently used entry to bring the total size back within the 100 MB limit.</figcaption>
  </figure>
</div>

## The challenge

While DiskLruCache efficiently manages cache size, it has a critical limitation: It does not account for the age of cached content. Due to the lack of time-based eviction rules, the cache does not remove outdated entries until it exceeds the maximum size. This meant that stale promotional images, images from infrequently used features, and outdated content continued occupying disk space indefinitely, as long as the cache remained under the size limit.
 
What we needed was a cache mechanism that could:

- **Maintain LRU cache benefits**: Preserve efficient caching for users who actively use the app features.

- **Remove stale content based on time:** Automatically identify and evict outdated entries, not just rely on storage constraints.

- **Protect user experience**: Ensure images still load quickly without cache misses.

- **Keep server costs low**: Avoid increased server requests from premature cache evictions.

These requirements pointed us toward an enhanced LRU approach. We needed to enhance LRU with time awareness while preserving its proven size-management capabilities.

## TLRU cache: The solution

To address these limitations, we developed a new LRU cache variant named TLRU that extends traditional LRU by introducing time-based eviction while maintaining size-based cache management.

### Core TLRU attributes

TLRU introduces three core attributes to manage cache entries:

- **Time-To-Live (TTL)**: A threshold that determines when a cache entry is considered expired. An entry is expired if `(current_time - last_accessed) > TTL`. Expired entries are automatically removed during cache operations.

- **Minimum cache size threshold**: A safety net that ensures a baseline set of essential images always remains cached, even when entries expire. This prevents complete cache deletion when users haven't used the app for more than the TTL period, maintaining app responsiveness for returning users instead of starting with an empty cache.

- **Maximum cache size**: Inherited from LRU cache, this enforces the upper storage limit (100 MB in our case). When exceeded, the least recently used entries are evicted regardless of their age.

Together, these attributes ensure TLRU maintains optimal cache size by managing both storage constraints and temporal relevance, reducing app disk footprint without impacting user experience.

### TLRU cache trimming in action

To better understand how TLRU works in practice, let's walk through a comprehensive example. The following diagrams demonstrate how the TLRU cache evaluates and trims entries based on both time and size constraints.

Our TLRU cache configuration includes:

- **Maximum cache size**: 100 MB - the storage limit that triggers size-based eviction.

- **Minimum size threshold**: 20 MB - the safety net that protects essential cached content.

- **TTL**: 20 days - entries older than this are considered expired.

Each cache entry includes `last_accessed` metadata containing the timestamp of its most recent access. When an entry is first created, this timestamp is initialized with the creation time. This timestamp determines whether an entry has expired based on the formula:

```
Entry is expired if: (current_time - last_accessed) > TTL
```

For this walkthrough, we'll use `current_time = Day 100` as our starting point.

#### Initial cache state analysis

Our example begins with three existing cache entries totaling 95 MB, approaching the 100 MB limit:

- **Item 1** (8 MB, last accessed Day 82): At 18 days old
- **Item 2** (30 MB, last accessed Day 81): At 19 days old
- **Item 3** (57 MB, last accessed Day 80): At exactly 20 days old, valid at the TTL threshold

When a new 10 MB item is added on Day 100, the cache grows to 105 MB, exceeding our 100 MB limit and triggering size-based eviction.

<div class="post-image-section"><figure>
  <img src="/img/image-caching/figure-3.png" alt="" style="width:60%"><figcaption align="middle">Figure 3. Initial TLRU cache state and the impact of adding new entries.</figcaption>
  </figure>
</div> 

#### Size-based eviction process

When the cache exceeds its 100 MB limit, TLRU applies traditional LRU eviction logic. **Item 3** is selected for eviction because:

- It is the least recently used entry (oldest access time).

- This demonstrates TLRU maintaining LRU behavior for size enforcement, regardless of expiration status.

<div class="post-image-section"><figure>
  <img src="/img/image-caching/figure-4.png" alt="" style="width:60%"><figcaption align="middle">Figure 4. Size-based eviction removes the least recently used entry to enforce storage limits.</figcaption>
  </figure>
</div> 

#### Time-based eviction process

Five days later (Day 105), Item 1 and Item 2 cross the expiration threshold:

Despite operating well below the size limit (48 MB < 100 MB), TLRU evaluates expired entries for time-based eviction. Item 2 is removed because it's expired, and the cache remains above the minimum threshold. Item 1, although also expired, is protected by the minimum threshold rule; removing it would leave only 10 MB, which falls below the 20 MB minimum.

<div class="post-image-section"><figure>
  <img src="/img/image-caching/figure-5.png" alt="" style="width:60%"><figcaption align="middle">Figure 5. Time-based eviction and minimum threshold protection working together.</figcaption>
  </figure>
</div> 

#### TLRU behavior summary

This comprehensive example demonstrates TLRU's three core mechanisms:

- **Size-based eviction**: Enforces storage limits using traditional LRU ordering (Item 3 removed despite being valid).

- **Time-based eviction**: Proactively removes expired content when safe to do so (Item 2 removed for age).

- **Minimum threshold protection**: Preserves essential cache functionality even with expired content (Item 1 protected despite expiration).

## Technical implementation

Rather than building an image cache from scratch, we recognized that Glide's bundled [DiskLruCache](https://github.com/bumptech/glide/blob/master/third_party/disklrucache/src/main/java/com/bumptech/glide/disklrucache/DiskLruCache.java) (originally from [Jake Wharton's implementation](https://github.com/JakeWharton/DiskLruCache)) already provided a mature, battle-tested foundation. This implementation is widely adopted across the Android ecosystem and handles complex edge cases like crash recovery, thread safety, and performance optimization that would require substantial effort to replicate.

Our approach was pragmatic, we cloned Glide's DiskLruCache and extended it to support time-based expiration. This strategy allowed us to inherit the existing reliability while adding the temporal awareness we needed for TLRU.

To understand our implementation, we'll first explore how the original DiskLruCache works, then dive into the specific modifications we made to transform it into TLRU.

### Understanding DiskLruCache

[DiskLruCache](https://github.com/bumptech/glide/blob/master/third_party/disklrucache/src/main/java/com/bumptech/glide/disklrucache/DiskLruCache.java) provides a simple cache solution that stores key-value pairs on disk, while also keeping track of their usage to evict the least recently used items when the cache reaches its maximum size. Here is an overview of how DiskLruCache is implemented:

- **Data storage**: DiskLruCache stores its data in a specified directory, creating files for each entry.

- **Key-based access**: Each entry has a unique key (typically a hash generated by the image loader) used to create the filename of the cached entry.

- **Atomic writes**: When adding an entry, it creates a temporary file and writes the data to it. If successful, it atomically renames the temporary file to the final filename.

- **Cache retrieval**: When reading from the cache, it looks up the key, opens the corresponding file on disk, and returns an InputStream to read the data.

- **Size management**: It maintains a maximum cache size limit. When exceeded, it removes the least recently used items until it is within the specified limit.

The central component that enables this functionality is the journaling mechanism, detailed in the following section.

#### The journaling mechanism

The journaling mechanism in DiskLruCache is designed to maintain consistency and prevent data corruption in the cache. The journal file records all cache operations, such as adding, updating, or removing entries. The journaling mechanism is essential in rebuilding the cache metadata during initialization and performing journal compaction to clean up the journal file. 

<div class="post-image-section"><figure>
  <img src="/img/image-caching/journaling-mechanism.png" alt="" style="width:70%"><figcaption align="middle">Figure 6. Example of the journaling mechanism in DiskLruCache.</figcaption>
  </figure>
</div> 

**Journal file format**:

The journal file is a plain text file that records cache operations line by line.

- DIRTY: Indicates the start of a write operation to a cache entry.

- CLEAN: Indicates that a cache entry was successfully written and closed.

- REMOVE: Indicates that a cache entry was removed from the cache.

- READ: Indicates that a cache entry was read.

To gain a comprehensive understanding of the journal file format, refer to the following detailed explanation.

- **Key information**: Each line includes the key and other relevant information, such as the lengths of the cache entry files.

- **Cache initialization**: Upon initialization, DiskLruCache reads the journal file to reconstruct cache metadata in memory, determining file associations, lengths, and access order. If the journal file is corrupted or missing, the cache will be considered invalid, and DiskLruCache will remove all cache files and start fresh.

- **Cache operations and journal updates**: When performing cache operations like adding, updating, or removing entries, DiskLruCache appends corresponding lines to the journal file, recording the operation details. For example, when starting to write a new cache entry, it writes a `DIRTY` line with the key, and when the write is successful, it appends a `CLEAN` line with the key and lengths.  

- **Synchronization and consistency:** DiskLruCache uses synchronization to ensure that only one thread can access the cache at a time, preventing race conditions and data corruption. It also uses a journalWriter (`java.io.Writer`) instance to append operations to the journal file, ensuring that the file is always in a consistent state.

- **Journal compaction**: Over time, the journal file may grow with redundant operations. DiskLruCache periodically compacts the journal by creating a new file that contains only the current cache metadata, then atomically replaces the old file. The compaction process usually happens when the journal file size exceeds a certain threshold.

DiskLruCache ensures consistency and prevents data corruption by using this journaling mechanism, making it a reliable solution for disk-based caching.

### Modifying DiskLruCache for TLRU

With a solid understanding of DiskLruCache's architecture, we can now explore how we extended it to implement the TLRU cache attributes defined earlier.

Three primary modifications to DiskLruCache:

- **Tracking last access time**:

To support time-based eviction, the cache needs to track when each entry was last accessed. This information must persist across app restarts, so it's stored in the journal file itself.

Modified journal format:

```
READ [Cache-Key] [Access-Timestamp]
CLEAN [Cache-Key] [File-Size]-[Access-Timestamp]
```

The timestamps are added to `READ` and `CLEAN` operations:

- **READ entries** record when a cache entry is accessed, updating its last-access time.  

- **CLEAN entries** record the creation time when a new entry is successfully added to the cache.

<div class="post-image-section"><figure>
  <img src="/img/image-caching/examplep-tlru-file.png" alt="" style="width:70%"><figcaption align="middle">Figure 7. Example of a TLRU journal file.</figcaption>
  </figure>
</div> 

- **Time-based eviction logic**:

The TLRU cache leverages the existing LRU ordering to optimize expiration checking. For each cache operation, it checks if the least recently accessed entry has expired before proceeding with time-based trimming.

The diagram below shows how the TLRU cache makes the decision to remove the cache entries.

<div class="post-image-section"><figure>
  <img src="/img/image-caching/figure-6.png" alt="" style="width:70%"><figcaption align="middle">Figure 8. TLRU eviction decision flow - evaluating cache entries based on time expiration and size constraints.</figcaption>
  </figure>
</div> 

The algorithm leverages the sorted nature of the cache: if the least recently accessed entry hasn't expired, no other entries need checking. If it has expired, the cache trim operation walks through entries from oldest to newest, removing all expired ones.

- **Backward-compatible migration**:

With an extensive user base, invalidating existing cached images would cause millions of users to experience poor performance while creating massive server traffic spikes and infrastructure costs.

One of the challenges was retrieving last-access timestamps from existing LRU entries, as file system APIs do not offer reliable access time data. Our solution was to set the last-access time of all existing entries to the migration timestamp. This approach preserves all cached content and establishes a consistent baseline, although it necessitates waiting one TTL period to realize the full benefits of eviction.

We also ensured bidirectional compatibility - the original LRU implementation can read TLRU journal files by ignoring timestamp suffixes, enabling safe rollbacks if needed.

Upon completing our TLRU implementation, we focused on determining optimal values for the three core attributes: **TTL duration**, **minimum threshold**, and **maximum cache size**. These parameters are crucial for balancing storage optimization and cache performance, requiring careful tuning based on real user behavior.

## Finding optimal configuration values

Finding optimal configuration values requires systematic experimentation and data-driven decision-making. Controlled experiments to compare the cache hit ratio with baseline LRU performance must be conducted.

*Note: Cache hit ratio, our key success metric, gauges efficiency by the percentage of requests served from cache versus requiring server downloads. Lower ratios lead to higher server costs and increased user data consumption.* 

Our success criteria is for a cache hit ratio decrease of no more than 3 percentage points (pp) during the transition to TLRU. For instance, a decrease from 59% to 56% hit ratio would result in 7% increase in server requests. This threshold balances storage optimization with acceptable performance impact.

To mitigate potential server cost impact from our maximum acceptable 3 pp cache hit ratio drop, we worked with the server team to optimize image delivery infrastructure, enabling a confident TLRU rollout without infrastructure cost concerns.

## Impact and results

After fully rolling out TLRU to production, we significantly optimized storage while preserving user experience. Post-implementation stabilization, the P95 total app size reduced by approximately 50 MB. This meant that 95% of our users experienced storage reduction up to 50 MB, with the top 5% seeing even greater savings.

With over 100 million downloads of the Grab Android app, even conservative estimates show terabytes of storage reclaimed across all user devices worldwide. This translates to better device performance, especially on low-end devices, and improved user satisfaction.

Critically, we maintained our success criteria: cache hit ratio stayed within target thresholds (no more than 3 pp decrease), with no increase in infrastructure costs. The seamless migration preserved all existing cache data without disruption.

## Conclusion

At Grab, we believe that every byte matters. Our users trust us with their device storage, and we take that responsibility seriously. The TLRU implementation exemplifies our commitment to user experience. We don't just build features, we optimize them to ensure our app respects our users' devices. The petabytes of storage reclaimed across millions of devices aren't just a technical achievement; it's a reflection of our dedication to creating a lighter, faster, more respectful mobile experience.

The implementation demonstrates that meaningful improvements can be achieved through thoughtful modifications to existing, well-tested libraries. Our focus on backward compatibility and safe migration ensured zero disruption for Grab's users, proving that user experience and technical innovation can coexist.

## Join Us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team today](https://grab.careers/)!

