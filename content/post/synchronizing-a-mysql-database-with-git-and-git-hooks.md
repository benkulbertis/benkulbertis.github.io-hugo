+++
date = "2011-10-29T19:19:00-04:00"
draft = false
title = "Synchronizing A MySQL Database with Git and Git Hooks"

+++

When I develop web based projects I often use a MySQL database to hold the data for my project. I also use git for source control and since I tend to work on my projects from several different computers I push and pull from a VPS of mine. This system works great for keeping all my source code in check and is easily accessible. However, I have had one issue. I was having to create a testing instance of my MySQL database on every computer that I pulled onto and worked from. This was a waste of time and also resulted in inconsistencies in my testing data which became confusing at times. I decided that I'd had enough of this and set out to find a solution.

I found <a title="Backup Your Database in Git" href="http://www.viget.com/extend/backup-your-database-in-git/" target="_blank">an article by David Eisinger entitled "Backup your Database in Git"</a> in which he suggested using mysqldump and simply adding the dump to the database. While I had hoped for a more elegant solution than simply dumping your database every time, it would certainly work. He also suggested using cron to schedule dumps. David wrote this article describing a way to backup a production site, which cron would work fine for, but for me it would have to be a little more complicated as I wanted an updated database on every commit.

To automate the process of dumping and restoring my database dumps I decided that <a title="Git Hooks" href="http://book.git-scm.com/5_git_hooks.html" target="_blank">git hooks</a> would be able to do the job. I had recently worked with git hooks as a way to <a title="Automatically Deploying Website From Remote Git Repository" href="http://caiustheory.com/automatically-deploying-website-from-remote-git-repository" target="_blank">deploy website updates directly from a git database</a>. Using the pre-commit hook and the post-merge hook, we can create a system  that will automatically dump and add your database to each commit and update your local database from each pull.

Let's start with pre-commit. The pre-commit hook will run a script directly before a commit is executed. To edit your pre-commit hook:

{{< highlight bash >}}
[your editor] /path/to/your/repo/.git/hooks/pre-commit
{{< /highlight >}}

Now, lets write the pre-commit script. We are going to tell the system to dump our MySQL database to our git repository and add it to be committed.

{{< highlight bash >}}
#!/bin/bash
mysqldump -u [mysql user] -p[mysql password] --skip-extended-insert [database] > /path/to/your/repo/[database].sql
cd /path/to/your/repo
git add [database].sql
{{< /highlight >}}

And mark the script executable.

{{< highlight bash >}}
chmod +x /path/to/your/repo/.git/hooks/pre-commit
{{< /highlight >}}

Now, lets write the post-merge script. We are going to tell the system to restore the MySQL dump to the local database for the latest changes. Edit the post-merge hook with:

{{< highlight bash >}}
[your editor] /path/to/your/repo/.git/hooks/post-merge
{{< /highlight >}}

And write:

{{< highlight bash >}}
#!/bin/bash
mysql -u [mysql user] -p[mysql password] [database] < /path/to/your/repo/[database].sql
{{< /highlight >}}

__Note that in both in the mysqldump and mysql commands, there is no space between the -p and the password.__

And let's mark this one executable too.

{{< highlight bash >}}
chmod +x /path/to/your/repo/.git/hooks/post-merge
{{< /highlight >}}

That is it! Now your MySQL database will be pushed and pulled with the rest of the commit and the pre-commit and post-merge hooks will handle the importing and exporting of the dumps.
