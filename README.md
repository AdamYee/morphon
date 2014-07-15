morphon
=======

An effort to provide modularity to Backbone through namespacing and event based architecture (wip).

#### Setup

    $ npm install

#### Tests

    $ mocha

#### Development tasks

    $ gulp

## Usage
#### NameSpace creation

Create a single namespace.

    var App = new Morphon.NameSpace('App');
    App.name; // 'App'

Or multiple namespaces.

    var App = new Morphon.NameSpace('App.Dashboard');
    App.get('Dashboard').name; // 'Dashboard'

Alternatively:

    var App = new Morphon.NameSpace('App');
    App.create('Dashboard');
    App.create('Dashboard.SideNav');
    App.create('Graphs', 'Dashboard');
    App.create('Messages');

The above would create a namespace structure like the following:

    App
     |
     |--DashBoard
     |         |
     |         |--SideNav
     |         |--Graphs
     |
     |--Messages