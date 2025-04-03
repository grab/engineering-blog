---
layout: post
id: 2025-04-03-facilitating-docs-as-code-with-markdown
title: 'Facilitating Docs-as-Code implementation for users unfamiliar with Markdown'
date: 2025-04-03 00:23:00
authors: [david-khu, preeti-karkera, sita-yadav, ziqin-yeow]
categories: [Engineering]
tags: [Blog, TechDocs, Helix, Engineering]
comments: true
cover_photo: /img/Facilitating-Docs-as-Code/banner-img-2.png
excerpt: "In this article, we’ll discuss how we’ve streamlined the Docs-as-Code process for technical contributors, specifically engineers, who are already familiar with GitLab but might face challenges with Markdown. Discover how we plan to improve the workflow for non-engineering teams contributing to service and standalone documentation."

---

# Introduction

Although Grab is a tech company, not everyone is an engineer. Many team members don’t use GitLab daily, and Markdown’s quirks can be challenging for them. This made adopting the Docs-as-Code culture a hurdle, particularly for non-engineering teams responsible for key engineering-facing documents. In this article, we’ll discuss how we’ve streamlined the Docs-as-Code process for technical contributors, specifically non-engineers, who are not very familiar with GitLab and might face challenges with Markdown. For more on the benefits of the Docs-as-Code approach, check out [this blog](https://engineering.grab.com/doc-as-code) on the subject.

As part of our ongoing efforts to enhance the TechDocs experience, we’ve introduced a rich text editor for those who prefer a [WYSIWYG (What You See Is What You Get)](https://en.wikipedia.org/wiki/WYSIWYG) interface on top of a Git workflow, helping to simplify authoring. We’ll also cover how we plan to improve the workflow for non-engineering teams contributing to service and standalone documentation.

# The need for a rich text editor

Ask any developer today, and they'll likely tell you that Markdown is the go-to format for documentation. Due to its simplicity, whether it’s GitHub, GitLab, Bitbucket, or other platforms, Markdown has become the default choice, even for issue tracking. It's also integrated into most text editors, like IntelliJ, VS Code, Vim, and Emacs, with handy plugins for syntax highlighting and previewing.

Engineers are gradually embracing the Docs-as-Code approach and enjoying the benefits of writing the documentation in Markdown format directly in their IDEs and pushing them out as merge requests (MR). However, non-engineers face the nuance of writing in Markdown and going through the Git workflow. This is when the call for a **WYSIWYG (What You See Is What You Get)** editor aka TechDocs editor came about. This solution brought about several benefits to non-engineers. It provides a familiar, UI-based experience for editing, but it still aligns with the Docs-as-Code model. This tool allows users to edit documentation via a simple UI in the Backstage portal without having to deal with the complexities of MkDocs, entity catalogs, or Markdown syntax. In the context Backstage, "entities" refer to services, platforms, tools, or libraries, and documentation is often tied to these entities to provide context sensitivity. The goal was to make it easy for people to focus on content, not the tools, and enable quick updates without the technical overhead.

We’ve kept GitLab as the central storage system, but now, with the TechDocs editor, non-engineers can contribute with ease. Figure 1 highlights our editor’s features:

- Reordering
- Renaming
- Deleting pages
- Switching between normal and Markdown views
- Formatting text with titles, bullets, numbering

<div class="post-image-section"><figure>
  <img src="/img/Facilitating-Docs-as-Code/figure-1.gif" alt="" style="width:80%"><figcaption align="middle">Figure 1: TechDocs editor in Helix</figcaption>
  </figure>
</div>

Our goal for our editor is to make it more flexible, performant, and user-friendly. Based on user feedback, key priorities include customisation, extensibility for non-standard Markdown elements, and long-term maintainability.

To achieve this, we selected the **Lexical framework**. Compared to other Markdown-based tools like Toast UI, Lexical offers greater extensibility, allowing us to implement advanced features such as autocomplete and support for non-standard Markdown elements like Kroki diagrams. 

The following flowchart illustrates how Markdown content is imported and exported within the Lexical editor, ensuring seamless integration with TechDocs.

<div class="post-image-section"><figure>
  <img src="/img/Facilitating-Docs-as-Code/figure-6.png" alt="" style="width:80%"><figcaption align="middle">Figure 2: Lexical Markdown transformer flow chart </figcaption>
  </figure>
</div>

By continuously iterating based on user needs, we aim to make Docs-as-Code accessible not just for engineers but for anyone contributing to documentation at Grab.

# User journeys 

We explored various workflows to streamline the documentation lifecycle, focusing on both creation and editing processes. By integrating these workflows into the developer portal, we ensured that users can easily create and edit documentation, enhancing overall efficiency and collaboration.

Here are the three key user journeys we focused on addressing:

### Journey 1: Edit existing TechDocs

#### High level workflow definition:

1. **Toggle to "edit" mode**: The user switches to the edit mode to start making changes to the TechDocs.  
2. **User starts editing TechDocs**: The user begins the process of editing the documentation and clicks save.  
3. **User gets redirected to GitLab**: If not authenticated, they are redirected to GitLab for authentication. Once authenticated, a merge request is created to update the entity YAML file and add the new TechDocs.  
4. **Access check**: The system checks if the user has access to the TechDocs file repository. If not, they are prompted to request access.

<div class="post-image-section"><figure>
  <img src="/img/Facilitating-Docs-as-Code/figure-3.png" alt="" style="width:80%"><figcaption align="middle">Figure 3: User journey 1</figcaption>
  </figure>
</div>

### Journey 2: Create stand-alone TechDocs from "Documentation" page 

#### High level workflow definition:

1. **User authentication**:  
   * If the user is not authenticated, they are redirected to GitLab for authentication.  
   * If the user is already authenticated, the process skips to the next step.  
2. **Registering merge requests**:  
   * The MR is registered to a scheduler job to automatically register a new entity catalog when it detects that the MR has been merged.

This workflow ensures that users are authenticated via GitLab before proceeding and that new entity catalogs are automatically registered upon the merging of MRs.

<div class="post-image-section"><figure>
  <img src="/img/Facilitating-Docs-as-Code/figure-4.png" alt="" style="width:80%"><figcaption align="middle">Figure 4: User journey 2</figcaption>
  </figure>
</div>


### Journey 3: Create TechDocs from "Docs" tab on entity page

#### High level workflow definition:

1. **Start creating TechDocs**:  
   * User selects 'create TechDocs' on the 'Docs' tab in the Helix UI.  
2. **Save and redirect**:  
   * User clicks 'save' and is redirected to GitLab with a Merge Request (MR) created to update the entity YAML file and add new TechDocs.  
3. **Access check and MR registration**:  
   * If the user has access to the entity YAML file repository, proceed with the MR. If not, prompt the user to get access.  
   * Register the MR to a scheduler job to automatically refresh the entity catalog when it detects the MR as merged.


<div class="post-image-section"><figure>
  <img src="/img/Facilitating-Docs-as-Code/figure-5.png" alt="" style="width:80%"><figcaption align="middle">Figure 5: User journey 3</figcaption>
  </figure>
</div>



## Phased rollout

We phased the rollout of our Markdown editor to ensure a smooth transition, allowing users to gradually adapt while we gathered feedback and iterated on features. This approach helped us address challenges early, refine usability, and deliver meaningful improvements with each phase.

### Phase 1: Initial markdown editor for developer portal

In Phase 1, we built a basic editor aligned with our documentation standards. Users can create and edit TechDocs for different entity catalogs, with support for basic Markdown and image previews for both absolute and relative paths. The editor tracks concurrent editing sessions and shows pending merge requests. It also includes Markdown configuration options to add, rename, reorganise, or delete pages. Additionally, our GitLab integration consolidates changes into a single commit and opens a merge request.

#### Phase 2: Independent documentation creation

Phase 2 includes expanded functionality to support independent documentation creation and related features, such as:

* HTML preview and image uploads (relative paths).  
* Save drafts locally in the browser.  
* Pending MRs listed in the editor.  
* Draw.io and Excalidraw integration for diagrams.  
* MkDocs updates: change site name.  
* Auto-registeration of new entity catalogs when MRs are merged.

### Phase 3: Advanced editor capabilities

Phase 3 introduced additional features, such as:

* Support for Kroki / Mermaid diagrams.  
* Display concurrent edit sessions for better collaboration.

Each phase improved the editor, enhancing TechDocs at Grab with seamless GitLab integration and user-friendly features.

## Integrating the ability to do a live preview

While syntax highlighting in the TechDocs editor is helpful, it can’t fully predict how the final Markdown document will appear once rendered due to Markdown flavour inconsistencies. This is especially true for elements like images, tables, and diagrams, where visual verification is crucial. To minimise these risks, the TechDocs editor includes a live preview feature, allowing users to see the fully rendered document alongside the editor in a split-screen view. This lets users verify their work as they go, preventing the need to switch back and forth between the editor and the final document, saving time and reducing potential formatting errors.

However, like most live preview features, performance challenges can arise. For larger documents, the process of continuously converting Markdown to HTML can slow down editing. External resources such as images that need to be re-rendered, can cause visual glitches or delays in the preview. Running scripts or using plugins with extended grammar also adds to the performance load, requiring frequent re-execution and potentially slowing down the experience.

To mitigate these issues, the TechDocs editor uses an inbuilt preview feature that shows users exactly how their changes are going to appear on the portal once their changes are merged. This ensures that users can confidently make adjustments and understand the final presentation before committing their updates. Additionally, the live preview feature enables more efficient collaboration by providing real-time feedback on content and formatting, further enhancing the overall documentation workflow.

## GitLab integration strategy

The TechDocs editor integrates seamlessly with GitLab, allowing users to make changes effortlessly through OAuth2 authentication. When users log into the editor, they simply click the "Connect with GitLab" button, which provides access via the OAuth 2.0 protocol. Once connected, all modifications made within the editor are executed using the user’s GitLab credentials, streamlining the documentation process and ensuring a smooth experience for users as they update their documentation directly within the TechDocs framework.

To minimise Git conflicts, we considered and implemented some of these approaches:

* Display pending merge requests at the top of the editor to alert users of existing changes.  
* Show who else is editing the same TechDocs to help users coordinate and avoid conflicts.  
* Include tools to automatically or semi-automatically resolve Git conflicts.

# Conclusion

Bringing Docs-as-Code to a broader audience at Grab meant addressing the challenges faced by non-engineering contributors. With the introduction of a WYSIWYG editor, seamless GitLab integration, and a live preview feature, we’ve made it easier for everyone to contribute without needing deep Markdown expertise.

As we continue to improve the TechDocs editor, our focus remains on removing barriers to documentation, enhancing collaboration, and ensuring that our docs evolve alongside our fast-moving engineering teams.

Docs-as-Code isn’t just about engineers writing documentation—it’s about making documentation a natural and frictionless part of the development process for everyone.


# Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility and digital financial services sectors. Serving over 800 cities in eight Southeast Asian countries, Grab enables millions of people everyday to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line – we aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
