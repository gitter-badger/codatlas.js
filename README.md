# codatlas.js
[Codatlas](http://codatlas.com) understands program just as your IDE
does. It's just for the Web from its very beginning. More scalable and
accessible. `codatlas.js` provides a convenient way to combine
[Codatlas](http://codatlas.com)'s powerful code analysis capability
with your web applications. Just a few lines of code, you get a better
and deeper understanding of you program!

## Example

<pre>
<code>
java.lang.ClassCastException: android.os.BinderProxy cannot be cast to com.ayst.healthkit.cq
at com.ayst.healthkit.bp.onServiceConnected(MainActivity.java:492)
at android.app.LoadedApk$ServiceDispatcher.doConnected(LoadedApk.java:1140)
at android.app.LoadedApk$ServiceDispatcher$RunConnection.run(LoadedApk.java:1157)
at android.os.Handler.handleCallback(Handler.java:808)
at android.os.Handler.dispatchMessage(Handler.java:103)
at android.os.Looper.loop(Looper.java:193)
at android.app.ActivityThread.main(ActivityThread.java:5292)
at java.lang.reflect.Method.invokeNative(Native Method)
at java.lang.reflect.Method.invoke(Method.java:515)
at com.android.internal.os.ZygoteInit$MethodAndArgsCaller.run(ZygoteInit.java:824)
at com.android.internal.os.ZygoteInit.main(ZygoteInit.java:640)
at dalvik.system.NativeStart.main(Native Method)
</code>
</pre>


## Getting started
Using codatlas service is simple, just put the following lines in your webpage:
````html
<script src="/codatlas.js"></script>
<link rel="stylesheet" href="/codatlas.css" />
````

