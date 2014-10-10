<!-- toc -->

Arglebargle is a static website compiler - like jekyll - but much harder 
to use.  It leans really heavily on gulp, as well as YAML, Handlebars, Markdown, and SASS, 
although if you don't mind futzing with the gulpfile you can swap out any of those 
dependencies for a tool that you would prefer. 

You might be thinking "why in the world would I want a website compiler that's
hard to use?"

Well, so that you can fiddle with it, of course.

Arglebargle doesn't have a complicated configuration syntax - your entire site
is generated with a gulpfile, some pretty bog-standard gulp tools, and a handful of
extra tools contained in the 'arglebargle' npm package. 
If you want to change how something works, you have to change the gulpfile.

If you don't want to change the gulpfile, arglebargle may not be the product for you. 

Getting Started
---------------

Install git, node, npm, and ruby.

Fork this repository, then `git clone` your fork of the repo.

You can also download the .zip file containing this repository
and unpack it in a directory on your computer. 

Open the git terminal, and navigate to the folder containing 
all of the code you just unpacked.

Install the 'sass', 'susy', and 'breakpoint' gems. 

    > gem install sass
    > gem install susy
    > gem install breakpoint

Install all of the node dependencies.

    > npm install

Install gulp-cli

    > npm install -g gulp

Then, tell gulp to do its thing.

    > gulp

This should produce a monstrous amount of output and produce a 
'target' folder containing the Arglebargle website.

The Source Directory
--------------------

So, you're going to want to change this site to more closely match, you know, 
what you want your blog to look like and do. 

Currently, most of this is defined by convention, in the 'source' directory. 

The structure works like this: 

* `source/config.yaml` - global variables, like "site name"
* `source/pages` - blocks of Markdown content that can be rendered into the site
* `source/posts` - YAML files corresponding with blog posts
* `source/theme` - a bunch of stuff describing how your site will look
* `source/theme/index.handlebars` - a Handlebars file describing how your index.html page will look.
* `source/theme/single.handlebars` - a Handlebars file describing how individual posts will be rendered.
* `source/theme/rss.handlebars` - a Handlebars file describing how your RSS will render. You don't need to touch this, pretty much at all.
* `source/theme/anythingelse.handlebars` - any files that aren't index, single, or RSS will compile into html files that you can link to. 
* `source/theme/partials` - Handlebars files that render before any of the other content. You can reference them in your main Handlebars files. 
* `source/theme/scss` - Sassy CSS.

### config.yaml

You can access any config.yaml property in your handlebars templates, like so:

#### /source/config.yaml
    
    title: "Awesome Website"

#### /source/theme/partials/header.handlebars
    
    <h2>\{{config.title}}</h2>

### pages

Pages contains .md files, which get compiled into partials that can be referenced
by handlebars templates. 

Because pages are part of the partials rendering step, pages themselves cannot be
referenced by partials, and they cannot have the same name as a partial. 

As an example, `about.md` in pages renders into the `about.html` partial, which
can then be insered into a page as follows:

#### /source/about.md
    
    Markdown text!

#### /source/theme/about.handlebars
    
    <h2> About </h2>
    \{{> partials/about }}

You'll notice that pages themselves do not get rendered into complete HTML pages. 

Instead, for each page that you render, you'll have to create its own handlebars
template. 

### posts
A post is a blog-style post, as a .yaml file. 

The mandatory fields are:

 * `title` - the title of the blog post
 * `created` - the time that the blog post was created. 
     this is parsed by moment.js, so any time that moment.js can parse should be fine, although
     I have a marked preference for ISO-8601 dates. 
 * `categories` - a list of the categories that this post falls under
 * `content-type` - how to render the content of this post

The content types that are built into the system are `youtube`, `image`, `html`, 
`markdown`, and `irc`.

The post object must also contain a field that matches the content-type - so, if the content-type
is `markdown`, the post must contain a `markdown` field that contains Markdown. 

Renderers are super-easy to write, but I'll cover that later in the documentation. 

Posts also have optional properties: 

 * `visible` - whether or not to render the blog post. Defaults to 'true'.

#### renderers

##### html
This is basically just a no-op pass-through renderer.

    title: 'HTML Post'
    created: '2014-06-07T12:00:00+07:00'
    categories: 
      - Examples
    content-type: html
    html: "<p>This is an <em>example</em> post rendered with HTML.</p>"

##### markdown
And this is just.. Markdown. 

    title: 'Markdown Post'
    created: '2014-06-08T12:00:00+07:00'
    categories: 
      - Examples
    content-type: markdown
    markdown: |
      sample markdown post
      --------------------
      This is a _sample_ post rendered with Markdown.

##### youtube
This one's a little more specialized. Include the hash of a youtube video and 
this renderer will convert it into a YouTube embedded video, if it can. 

    title: 'Youtube Post'
    created: '2014-06-09T12:00:00+07:00'
    categories: 
      - Examples
    content-type: youtube
    youtube: 'UXutkplDxik'

##### image
An image! Or group of images! Of course, if you're writing a proper Markdown or HTML 
post, you can include images, but sometimes your post is just image content. 

This renderer also checks the 'alt-text' property, and will preserve it if present.

    title: 'Image Post'
    created: '2014-06-10T12:00:00+07:00'
    categories: 
      - Examples
    content-type: image
    image: 'http://curtis.lassam.net/comics/cube_drone/great_art_time/1.gif'
    alt-text: 'marquee king'

Or multiple images:

    title: 'Gallery Post'
    created: '2014-06-11T12:00:00+07:00'
    categories: 
      - Examples
    content-type: image
    image: 
      - 'http://curtis.lassam.net/comics/cube_drone/great_art_time/1.gif'
      - 'http://curtis.lassam.net/comics/cube_drone/great_art_time/2.gif'
    alt-text: 'until I fix it, this alt text is for all of the images'

##### irc
This one is ... painfully specific, the copy-and-paste format of my favourite IRC chat client.
    
    title: 'IRC Post'
    created: '2014-06-12T12:00:00+07:00'
    categories: 
      - Examples
    content-type: irc
    irc: |
      <eqj^w^> boy I love being given someone else's half-done project and told to finish it :|
      <eqj^w^> gosh jolly
      <eqj^w^> and if that wasn't enough it sure is even better when I'm the one that 
      <eqj^w^> has to tell them I'm taking over
      <eqj^w^> hey buddy pal that thing you've been doing for a week? yeah just stop.
      <cube_drone_> That's not the right way to do it. 
      <eqj^w^> it sucks so bad they're making me finish it
      <eqj^w^> k thx
      <cube_drone_> 1. Buy combat boots
      <eqj^w^> ok I like it already, go on
      <tooth> implying she doesn't have them already
      <cube_drone_> 2. Kick down their door. If they don't have one, because they're at a cubicle,
      <cube_drone_> go to a hardware store, 
      <cube_drone_> buy one, and prop it up on their cubicle, then kick it down
      <eqj^w^> what if they're in ontario?
      <eqj^w^> AND in a cubicle
      <eqj^w^> ain't no one wants to go there
      <eqj^w^> but tooth is closest
      <cube_drone_> Buy the door, then record yourself kicking it down with a webcam, 
      <cube_drone_> then convert the movie into an animated gif, then print out the animated gif
      <cube_drone_> frame by frame on individual sheets of paper 
      <cube_drone_> and mail it to them using high priority overnight mail. 
      <eqj^w^> hahahaha
      <cube_drone_> On the last page, scrawl "YOUR PROJECT IS MINE. ALSO I NEED YOUR CLOTHES."
      <eqj^w^> \o/
      <cube_drone_> Then include, as the last picture, Arnold Schwarzenegger as the Terminator, naked. 

### theme
The theme folder contains the files that determine how the site's gonna look!

#### diy-handlebars-helpers
All of the Handlebars files have access to the complete set of [diy-handlebars-helpers](https://github.com/diy/handlebars-helpers). 

#### single.handlebars
single.handlebars is responsible for rendering every single Post in `/source/posts`

When rendering a Post object in Handlebars, it has the following properties: 
 
 * `title` - this Post's title.
 * `html` - whatever the Renderers have decided is the html content of this Post. If you want it to display properly, 
  you'll have to wrap it in triple-moustaches in Handlebars - `\{{{html}}}` - otherwise Handlebars will 
  automatically escape it for you. 
 * `human_datetime` - a human readable date and time.
 * `human_date` - a human-readable date.
 * `human_time` - a human-readable time.  
 * `pubdate` - a date and time, formatted for an RSS feed.
 * `created` - the datetime, but in whatever format it was in the original post object
 * `first` - the very first Post object. 
 * `last` - the very last Post object.
 * `previous` - the Post object immediately before this Post, chronologically. May not exist. 
 * `next` - the Post object immediately after this Post, chronologically. May not exist. 
 * `category_items` - an array of objects, each object containing:
   * `name` - the name of the category
   * `first` - the first Post object in this category
   * `last` - the last Post object in this category
   * `previous` - the Post object _in this category_ immediately before this Post, chronologically. May not exist.
   * `next` - the Post object _in this category_ immediately after this Post, chronologically. May not exist. 

#### index.handlebars
A Handlebars file, which describes what the front page of your website will look like, when generated. 

This file has access to the following variables: 

 * `index`, a reverse-chronologically ordered array of Post objects, from most to least recent. 
 * `first`, the first Post object that exists. 
 * `last`, the last Post object that exists. 
 * `categories`, an object, where each key is the name of a category ("Videos"), and each value is the chronologically ordered 
    list of Posts in that category. 

#### rss.handlebars
This file is responsible for generating a `rss.xml` file for your site. 

#### anything else.handlebars ####
Any file that's not `index.handlebars`, `single.handlebars` or `rss.handlebars` will be rendered, handed the same set of variables
as `index.handlebars`, and converted into an html file.

So, if you have `about.handlebars`, it will be converted into `about.html`, which you can reference in your HTML. 

#### partials ####
Any handlebars file in the `/source/theme/partials` directory will be given 
the same variables as `index.handlebars` and made available to the 
main Handlebars files.

#### SCSS ####
Things in the `/source/theme/scss` directory will be compiled with ruby-sass
into css files in `/target/css/`.

#### Images ####
Things in the `/source/theme/images` directory will be moved to `/target/images`.

The Gulpfile
------------

The gulpfile contains all of the steps in the compilation of the application.
I've done my best to fill it with documentation, so if you want to 
learn how to modify the application to add your own features or functionality,
that would be a great place to start. 
