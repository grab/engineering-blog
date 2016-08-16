Grab Engineering Blog
===========

Welcome to Grab's official engineering blog where we share the good engineering practices in Grab and the things we engineers do that can benefit other engineers in the industry. Comments and feedback are welcome!

### Getting Started

The blog runs on [Jekyll](https://jekyllrb.com), an awesome static site builder that is written in Ruby. To get started, clone the repository and run the following steps:

```
$ gem install bundler
$ bundle install
$ bundle exec jekyll serve
```

Navigate to `http://localhost:4000` to view the blog. A process runs in the background to watch for changes made to the code. Simply refresh the page to see the updated changes. If you are new to Jekyll, we would recommend that you check out their detailed documentation [here](https://jekyllrb.com/docs/home/).

### Contributing

Interested in writing a blog entry to the blog? Simply fork the repository and make a pull request with the new entry, a markdown file in the `_posts` folder with the name `YYYY-MM-DD-your-title.md`.

Each post should have the following front matter defined:

|Property|Explanation|Example
|:---|:---|:---|
|`layout`|The layout template from the `_layouts` directory. We only have `post` for now.|`post`|
|`id`|Unique id for each blog entry. This is used by Disqus to uniquely identify posts and should not be modified if a Disqus thread for that post already exists.|`curious-case-of-the-phantom-instance`|
|`title`|Title of blog entry|`The Curious Case of The Phantom Instance`|
|`date`|Date of entry in `DDDD-MM-YY HH:MM:SS` format|`2015-12-28 04:39:00`|
|`author`|Author of blog entry|`Lian Yuanlin`|
|`author_thumbnail`|URL to your thumbnail|`https://avatars2.githubusercontent.com/u/10098065?v=3&s=400`|
|`comments`|Whether to display Disqus comments box. Why would you set this to `false`?|`true`|
|`excerpt`|Your catchy excerpt that will be shown on the list of blog entries page. Wrap your excerpt in quotes if it spans across multiple lines.|`"Here at the Grab Engineering team, we have built our entire backend stack on top of Amazon Web Services (AWS). Over time, it was inevitable that some habits have started to form when perceiving our backend monitoring statistics."`|

Proceed to write your blog entry in [Github-flavoured Markdown](https://help.github.com/articles/basic-writing-and-formatting-syntax/) format. Should you want to add images to your blog entry, the files should be added to the `img/<post-id>` folder.

When you are done with your entry, simply make a pull request and ping us in the `#eng-bloggers` Slack channel to request for a review!

That's it, happy blogging!

### License

MIT License
