---
layout: post
id: 2023-05-15-faster_using_the_go_plugin_to_replace_Lua_VM
title: 2.3x faster using the Go plugin to replace Lua virtual machine
date: 2023-05-15 01:23:05
authors: [yonghao-hu, fabianto-wangsamulya]
categories: [Engineering]
tags: [Engineering, Virtual machines, Faster, Go plugin, Lua VM]
comments: true
cover_photo: /img/faster_using_the_go_plugin_to_replace_Lua_VM/cover.png
excerpt: "The Talaria open-source project has made significant improvements by replacing Lua VM with the Go plugin resulting in 2.3x faster performance and memory usage reduction. Talaria is a time-series database designed for Big Data systems used to process millions of transactions and connections daily at Grab, requiring scalable data-driven decision-making."
---

## Abstract
We’re excited to share with you the latest update on our open-source project [Talaria](https://github.com/kelindar/talaria). In our efforts to improve performance and overcome infrastructure limitations, we’ve made significant strides by implementing the [Go plugin](https://pkg.go.dev/plugin) to replace Lua VM.


Our team has found that the [Go plugin](https://pkg.go.dev/plugin) is roughly 2.3x faster and uses 2.3x less memory than the Lua VM. This significant performance boost has helped us improve overall functionality, scalability, and speed.


For those who aren’t familiar, Talaria is a distributed, highly available, and low-latency time-series database that’s designed for Big Data systems. [Originally developed and implemented at Grab](https://engineering.grab.com/big-data-real-time-presto-talariadb), Talaria is a critical component in processing millions and millions of transactions and connections every day, which demands scalable, data-driven decision-making.


## Background
One of the methods we previously used for processing ingested data was [Lua script](https://github.com/talariadb/talaria/blob/51560d23faed1c0d8174531142ef3314cfdc86b1/internal/scripting/script_test.go#L14). This method allowed users to customise the ingestion process, providing a high degree of flexibility.


The config below is an example of using Lua script to JSON encode the row as a data column:
~~~
computed:
  - name: data
    type: json
    func: |
      local json = require("json")
      function main(row)
        return json.encode(row)
      end     
~~~

## Problem
We found that loading a Lua script required launching a Lua virtual machine (VM) to execute the script, which had a significant impact on performance, especially when ingesting large amounts of events.


This performance issue led us to reevaluate our approach to processing ingested data and make changes to improve Talaria’s performance.


As a result, this is the code we used on Lua VM to run the trim, remove keys "key1", "key2", "key3", "key4", "key5", in the ingested data:

~~~
import "github.com/kelindar/lua"

func luaTrim() string {
    s, err := lua.FromString("test.lua", `
    local json = require("json")
    local keys = {
    "key1", "key2", "key3", "key4", "key5",
    }
    function main(input)
        local data = json.decode(input)
        for i, key in ipairs(keys) do
            data[key] = nil
        end
        return json.encode(data)
    end
`)
    if err != nil {
        panic(err)
    }
    result, err := s.Run(context.Background(), jsonstr)
    if err != nil {
        panic(err)
    }
    return result.String()
}
~~~

Here is the benchmark, using Lua VM is 1000 times slower and uses 1000 times more memory than Golang's native function on a Trim function:

<table class="table">
  <thead>
    <tr>
      <th>BenchmarkTrim-12  </th>
      <th>543541 </th>
      <th>2258 ns/op</th>
      <th>848 B/op</th>
      <th>12 allocs/op</th>
    </tr>
  </thead>
  <thead>
    <tr>
      <th>BenchmarkLuaTrim-12 </th>
      <th>553</th>
      <th>2105506 ns/op</th>
      <th>5006319 B/op</th>
      <th>10335 allocs/op</th>
    </tr>
  </thead>
</table>

But, anything can be improved by adding a cache, what if we cache the Lua VM and reuse them? Here is the new improved benchmark:

<table class="table">
  <thead>
    <tr>
      <th>BenchmarkTrim-8</th>
      <th>232105 </th>
      <th>4995 ns/op </th>
      <th>2192 B/op </th>
      <th>53 allocs/op</th>
    </tr>
  </thead>
  <thead>
    <tr>
      <th>BenchmarkLuaTrim-8</th>
      <th>97536</th>
      <th>12108 ns/op </th>
      <th>4573 B/op </th>
      <th>121 allocs/op</th>
    </tr>
  </thead>
</table>

So we can conclude that Lua VMs are roughly 2.3x faster and use 2.3x less memory than Golang's native function.

## Use the Go plugin as Lua VM to execute custom code
We came up with the idea of using a [Linux shared library](https://developer.ibm.com/tutorials/l-dynamic-libraries/) to execute the custom function instead of using Lua VM to run the custom script. Maybe you will be more familiar with the files with suffixes `.so`; they are shared libraries designed to package similar functionality in a single unit and shared with other developers so that they can call the function without writing it again.


In Golang, a similar idea is called [Go plugin](https://pkg.go.dev/plugin), which allows you to build Golang code as a shared library (Golang names it a plugin). Open this file and call the Go function inside this plugin.

### How to use the Go plugin
Let's say you have a function F that wants to be called via the plugin.

~~~
package main
import "fmt"
func F() { fmt.Printf("Hello, world") }
~~~

After writing the function F, you can compile it as a Go plugin file f_plugin.so via Go build -buildmode=plugin -o f_plugin.so. And you can open the file and use the function F like this:

~~~
p, err := plugin.Open("f_plugin.so")
if err != nil {
    panic(err)
}
f, err := p.Lookup("F")
if err != nil {
    panic(err)
}
f.(func())() // prints "Hello, world"
~~~

### Go plugin benchmark
Here is the result that compares Golang native function, Golang plugin call.

Golang native function: 2.3x faster and 2.3x lesser memory than using the Lua VM.
Golang plugin call has almost the same performance as Golang native function.

<table class="table">
  <thead>
    <tr>
      <th>BenchmarkNativeFunctionCall-12</th>
      <th>2917465 </th>
      <th>401.7 ns/op </th>
      <th>200 B/op</th>
      <th>6 allocs/op</th>
    </tr>
  </thead>
  <thead>
    <tr>
      <th>BenchmarkPluginCall-12</th>
      <th>2778988 </th>
      <th>447.1 ns/op  </th>
      <th>200 B/op </th>
      <th>6 allocs/op</th>
    </tr>
  </thead>
</table>


### Integrated into Talaria
This is the MR we integrated the Go plugin into Talaria: [https://github.com/talariadb/talaria/pull/87](https://github.com/talariadb/talaria/pull/87), adding it as a loader like LuaLoader.


They both implemented the Handler interfaces.

~~~
type Handler interface {
    Load(uriOrCode string) (Handler, error)
    String() string
    Value(map[string]interface{}) (interface{}, error)
}
~~~
The implementation of this interface is listed here:

#### For Lua loader

**Load**: Load the Lua code or Lua script file path (local file path or s3 path) as the loader.

**String**: Return "lua" so that we can call it to get what the loader is.

**Value**: Run the Lua script, and take the arg as input.

#### For Go plugin loader

**Load**: Read the plugin file path (local file path or s3 path) as the plugin, lookup the function name defined by the user, save the function for later use.

**String**: Return "plugin" so that we can call it to get what the loader is.

**Value**: Run the saved function, take the arg as input.

## Things you need to notice
The Go version you used to build the  Golang plugin must be the same as the service used in that plugin. We use Docker to build the service, so that we can ensure the Go version is the same.


## Reference (Benchmark plugin and LUA)
https://github.com/atlas-comstock/talaria_benchmark/tree/master/benchmark_plugin_and_lua

# Join us
Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
