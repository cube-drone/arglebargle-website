arglebargle-website
===================

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

Install the 'sass' and 'susy' gems. 

    > gem install sass
    > gem install susy

Install all of the node dependencies.

    > npm install

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

* _source/config.yaml_ - global variables, like "site name"
* _source/pages_ - blocks of Markdown content that can be rendered into the site
* _source/posts_ - YAML files corresponding with blog posts
* _source/theme_ - a bunch of stuff describing how your site will look
* _source/theme/index.handlebars_ - a Handlebars file describing how your index.html page will look.
* _source/theme/single.handlebars_ - a Handlebars file describing how individual posts will be rendered.
* _source/theme/rss.handlebars_ - a Handlebars file describing how your RSS will render. You don't need to touch this, pretty much at all.
* _source/theme/anything_else.handlebars - any files that aren't index, single, or RSS will compile into html files that you can link to. 
* _source/theme/partials_ - Handlebars files that render before any of the other content. You can reference them in your main Handlebars files. 
* _source/theme/scss_ - Sassy CSS.




