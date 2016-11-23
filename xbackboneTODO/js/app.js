(function(){
    var app = app || {};

    const ENTER_KEY = 13,
          ESC_KEY   = 27;

// --------- Model ---------- //
// --------- Model ---------- //
// --------- Model ---------- //

    app.Model = Backbone.Model.extend({

        defaults: {
            title: '',
            completed: false,
        },

        toggleCompleted: function(){
            this.save({completed: !this.get('completed') }); //save
        }
    });

// --------- Collection ---------- //
// --------- Collection ---------- //
// --------- Collection ---------- //

    var ItemsCollection = Backbone.Collection.extend({

        model: app.Model,

        // Save app items under 'backbone-todos' namespace
        localStorage: new Backbone.LocalStorage('backbone-todos'),

        nextId: function(){
                console.log(this, this.length, this.last(),  'COLEECTION  GET ID');
                return
                this.length ?
                                this.last().get('id')+1
                            :   1;
        },

        completed: function(){
                return this.where({completed: true});
        },

        active: function(){
                return this.where({completed: false});
        },
    });

    // make instance
    app.Collection = new ItemsCollection();


// --------- View Item ---------- //
// --------- View Item ---------- //
// --------- View Item ---------- //

// Link btw ViewItem and ViewItems, Collection; is the same memory area - the Model
// ViewItems has internal pointer to Collection
// Collection has internal array models
// ViewItem - has CRUD operations on itself.

    app.ViewItem = Backbone.View.extend({

        tagName: 'li',

        template: _.template( $('#item-tpl').html() ),

        model: null,
        $input: null,

        events: {
                // for callbacks: this = view
                'dblclick label': 'toggleEdit',
                'click label': 'toggleEdit',
                'keydown .edit': 'saveOnEnter',
                'click input.completed': 'toggleCompleted',
                'click .remove': 'removeItem'
        },

        initialize: function(){

                _.bindAll(this, 'render' );

                this.listenTo(this.model, 'change', this.render );
                // on DELETE on server, view.remove() removes listeners, DOM el
                this.listenTo(this.model, 'destroy', this.remove );

                this.listenTo(this.model, 'visible', this.visible);
                //return this;
        },

        render: function(){

                this.$el.html( this.template( this.model.attributes ) );
                this.$input = this.$('.edit');
                app.Collection.trigger('change');
                return this;
        },

        toggleEdit: function(){
                this.$el.toggleClass('edit-mode');
                this.$input.focus();
        },

        saveOnEnter: function(e){

                if ( e.which === ESC_KEY ) {
                    this.$el.toggleClass('edit-mode');
                    this.render();
                    return;
                }

                if( e.which === ENTER_KEY && this.$input.val().trim() ){

                    this.model.save({title: this.$input.val().trim() });
                    this.$el.toggleClass('edit-mode');
                }
        },

        toggleCompleted: function(){
                this.model.toggleCompleted();
        },

        removeItem: function(){
                this.model.destroy();
        },

        visible: function(){
                this.$el.toggleClass('hidden', this.isHidden() );
        },

        isHidden: function(){
                if (!app.Route.filterParam) return false;

                return this.model.get('completed') ?
                    app.Route.filterParam === 'active' :
                    app.Route.filterParam === 'completed' ;

        }
    });

// --------- Router ---------- //
// --------- Router ---------- //
// --------- Router ---------- //

    Router = Backbone.Router.extend({

        routes: {
                '*filter': 'filterItems'
        },

        filters: ['active', 'completed'],

        filterParam: '',

        filterItems: function(param){

                param = _.escape(param);

                if( _.indexOf( this.filters, param ) !== -1 ){

                    this.filterParam = param;
                    app.Collection.trigger('filter');
                }
        },
    });
    app.Route = new Router();

    Backbone.history.start();

// --------- View Items ---------- //
// --------- View Items ---------- //
// --------- View Items ---------- //

    app.AppView = Backbone.View.extend({


        el: '',

        events: {
                'keypress .new-item' : 'newOnEnter',
                'click .displayAll'  : 'resetFilter',
                'click .clear-completed-items': 'clearCompleted',
                'click .toggle-all' : 'toggleAllCompleted',
        },

        statsTemplate: _.template( $('#stats-tpl').html() ),

        initialize: function(){

                this.$newInput = this.$('.new-item');
                this.toggleAll = this.$('.toggle-all')[0];
                this.$list = this.$('.list-items');
                this.$stats = this.$('footer');

                _.bindAll(this, 'getItemAttrs', 'newItem', 'addViewItem');

                console.log(this,this.collection, 'APP-VIEW');

                // callback will receive Model as parameter
                this.listenTo( this.collection, 'add', this.addViewItem );
                this.listenTo( this.collection, 'all', this.render );
    			this.listenTo( this.collection, 'change:completed', this.filterOne );
    			this.listenTo( this.collection, 'filter', this.filterAll );

                this.collection.fetch();

                app.Route.filterParam ? this.collection.trigger('filter') : null;
        },

        render: function(){
                var completed = this.collection.completed().length,
                    active = this.collection.active().length;

                this.$stats.html( this.statsTemplate( {
                    completed: completed,
                    active: active ,
                    } ));
                // set filter active link
                this.$('.filters a[href="#/'+app.Route.filterParam+'"]').addClass('selected-filter');
                // set checked all, if so
                this.toggleAll.checked = (active == 0 && completed > 0);
        },

        newOnEnter: function(e){
                if( e.which === ENTER_KEY && this.$newInput.val().trim() ){

                    this.newItem( this.getItemAttrs() );
                }
        },

        getItemAttrs: function(){
                // return a data obj to create the Model
                 return {
                    title: this.$newInput.val().trim(),
                    completed: false,
                    order: this.collection.nextId(),
                };
        },

        newItem: function( item ){
                // add a Model to app Collection, plain obj.
                this.collection.create( item ); //create - send to server
                this.$newInput.val('');
        },

        addViewItem: function( model ){
                // Link btw ViewItem, ViewItems, Collection; is the same memory area - the Model
                var view = new app.ViewItem({ model: model });
                this.$list.append( view.render().el );
        },

        filterOne: function( model ){
                model.trigger('visible');
        },

        filterAll: function(){
                this.collection.each(this.filterOne, this);
        },

        resetFilter: function(){
                app.Route.filterParam = '';
                this.filterAll();
        },

        clearCompleted: function(){
                _.invoke( this.collection.completed(), 'destroy' );
        },

        toggleAllCompleted: function(){

                var completed = this.toggleAll.checked;

                _.invoke( this.collection.models, 'save', { completed: completed } );

                // this.collection.each(function(model){
                //         model.save({completed: completed});
                // });
        }
    });

    new app.AppView({el: '.app', collection: app.Collection });


})();
