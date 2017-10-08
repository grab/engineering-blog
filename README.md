Grab Engineering Blog
===========

Welcome to Grab's official engineering blog where we share the good engineering practices in Grab and the things we engineers do that can benefit other engineers in the industry. Comments and feedback are welcome!

### Getting Started

The blog runs on [Jekyll](https://jekyllrb.com), an awesome static site builder that is written in Ruby. To get started, clone the repository and run the following steps:

```sh
$ gem install bundler
$ bundle install
$ bundle exec jekyll serve
```

Navigate to `http://localhost:4000` to view the blog. A process runs in the background to watch for changes made to the code. Simply refresh the page to see the updated changes. If you are new to Jekyll, we would recommend that you check out their detailed documentation [here](https://jekyllrb.com/docs/home/).

### Contributing

Interested in writing a blog entry to the blog? Simply fork the repository and make a pull request with the new entry, a markdown file in the `_posts` folder with the name `YYYY-MM-DD-your-title.md`.

#### Adding Authors

If you are a new author, add your bio to `_data/authors.yml`, for example:

```yml
lian-yuanlin: # This is the ID of the author
  name: Lian Yuanlin
  thumbnail: /img/authors/lian-yuanlin.jpg # Use a remote image or add your own image
  github: alienchow # GitHub Username (optional)
```

#### Writing your post

Each post should have the following front matter defined:

|Property|Explanation|Example
|:---|:---|:---|
|`layout`|The layout template from the `_layouts` directory. We only have `post` for now.|`post`|
|`id`|Unique id for each blog entry. This is used by Disqus to uniquely identify posts and should not be modified if a Disqus thread for that post already exists.|`curious-case-of-the-phantom-instance`|
|`title`|Title of blog entry|`The Curious Case of The Phantom Instance`|
|`date`|Date of entry in `DDDD-MM-YY HH:MM:SS` format|`2015-12-28 04:39:00`. Note that this is in UTC and posts in the future will not be displayed. To such posts during development, use `bundle exec jekyll serve --future` |
|`authors`|YAML list of author IDs. The author bio will be retrieved from `_data/authors.yml` and displayed within the post.|`[lian-yuanlin, ...]`|
|`categories`|YAML list of categories, sorted alphabetically. Only use existing categories in `_data/categories.yml`.|`[Engineering]`|
|`tags`|YAML list of tags, sorted alphabetically. Please check existing tags on `/tags` and reuse where possible.|`[AWS, Golang]`|
|`cover_photo`|Relative URL to the FB open graph image|`/img/grab-vietnam-careers-week/son-hai.jpg`|
|`comments`|Whether to display Disqus comments box. Why would you set this to `false`?|`true`|
|`excerpt`|Your catchy excerpt that will be shown on the list of blog entries page. Wrap your excerpt in quotes if it spans across multiple lines.|`"Here at the Grab Engineering team, we have built our entire backend stack on top of Amazon Web Services (AWS). Over time, it was inevitable that some habits have started to form when perceiving our backend monitoring statistics."`|

Proceed to write your blog entry in [GitHub-flavoured Markdown](https://help.github.com/articles/basic-writing-and-formatting-syntax/) format. Should you want to add images to your blog entry, the files should be added to the `img/<post-id>` folder.

When you are done with your entry, simply make a pull request and ping us in the `#eng-bloggers` Slack channel to request for a review!

That's it, happy blogging!

### Deployment

Since we are using custom plugins (such as for authors), GitHub will not build and deploy the generated site for us. We use a custom gem `jgd` meant for deploying Jekyll pages manually.

```sh
$ jgd
```

This step is automatically carried out on Travis CI, you just need to commit on master to trigger the script. For more details, see the script in `.travis.yml`.

### License

MIT License
