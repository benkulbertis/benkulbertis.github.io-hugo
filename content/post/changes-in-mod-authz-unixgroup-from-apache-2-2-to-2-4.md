+++
date = "2016-03-23T16:36:34-06:00"
draft = false
title = "Changes in mod_authz_unixgroup from Apache 2.2 to 2.4"

+++

mod_authz_unixgroup is an Apache module that can be used to allow members of Unix groups on the server to access restricted content with their Unix user credentials. These groups are defined in a <a href="https://httpd.apache.org/docs/2.4/mod/mod_authz_core.html#require" target="_blank">Require</a> directive and therefore it can be used with essentially any <a href="https://httpd.apache.org/docs/current/mod/mod_authn_core.html#authtype" target="_blank">AuthType</a>. We utilize this extensively at my place of work, as all our users and groups are stored in our Active Directory, which are then mapped to Unix users and groups on all our machines via pam_ldap.

When switching from Apache 2.2 to 2.4, I experienced some issues with compatibility with our current implementation of the module. Under 2.2, the module had to be initialized with 'AuthzUnixgroup On' and the Require directive was 'Require group mygroup'. The whole configuration looked something like this:

{{< highlight apache >}}
AuthType Basic
AuthzUnixgroup on
Require group mygroup
{{< /highlight >}}

However, this resulted in a 500 error with the following in the logs on Apache 2.4:

{{< highlight text >}}
Invalid command 'AuthzUnixgroup', perhaps misspelled or defined by a module not included in the server configuration
{{< /highlight >}}

Surprisingly, I couldn't find any sign of this error in Google searches. The module was definitely loaded but this directive was unrecognized with no further explanation. I was about to compile the module from source in an attempt to troubleshoot when I found the answer buried in the <a href="https://raw.githubusercontent.com/phokz/mod-auth-external/master/mod_authz_unixgroup/INSTALL" target="_blank">INSTALL file</a>:

> Previous versions of mod_authz_unixgroup needed a 'AuthzUnixgroup on' to tell Apache that the "Require file-group" (or "Require group") directive was supposed to be handled by mod_authz_unixgroup. Now we have a distinct directive, "Require unix-file-group" (and "Require unix-group") instead, so the 'AuthzUnixgroup' is no longer needed and no longer exists.

That certainly explained my error. Now, our configurations look more like this on Apache 2.4:

{{< highlight apache >}}
AuthType Basic
Require unix-group mygroup
{{< /highlight >}}

Behavior is now identical to how it was on 2.2.
