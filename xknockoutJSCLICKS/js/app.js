(function(){

    /* ====== Model DATA ====== */

      var model = {
        items: [
          {
            name: "Mrrr",
            nickname: ["Miu", "Miau", "Micmic"],
            srcSm: "http://placekitten.com/g/300/300",
            srcMd: "http://placekitten.com/g/300/300",
            srcLg: "http://placekitten.com/g/300/300",
            clickCount: 0,
          },
          {
            name: "Aneta",
            nickname: ["Looooovely"],
            srcSm: "http://placekitten.com/g/400/400",
            srcMd: "http://placekitten.com/g/400/400",
            srcLg: "http://placekitten.com/g/400/400",
            clickCount: 0,
          },
          {
            name: "Ponca",
            nickname: ["Poooo"],
            srcSm: "http://placekitten.com/g/500/500",
            srcMd: "http://placekitten.com/g/500/500",
            srcLg: "http://placekitten.com/g/500/500",
            clickCount: 0,
          }
        ],
        isAdmin: true
      };



    /* ====== Model ====== */

    var ModelItem = function( data ){

        var _self = this;
        _self.name = ko.observable(data.name);
        _self.clicks = ko.observable(data.clickCount);
        _self.srcSm = ko.observable(data.srcSm);
        _self.srcMd = ko.observable(data.srcMd);
        _self.nickname = ko.observableArray(data.nickname);

        _self.level = ko.computed(function(){

            return Math.floor(_self.clicks() / 10);;
        });
    }



   /* ====== ViewModel ====== */

   var AppViewModel = function( isAdmin, items ){

      var _self = this;
      _self.isAdmin = isAdmin;
      _self.items = ko.observableArray([]);
      _self.currentItem = null;

      // Add Item
      _self.addItem = function( data ){
          _self.items.push( new ModelItem( data ) );
      }

      // Init, instantiate
      _self.instantiateItems = function( items ){

            items.forEach(function(item){
                _self.addItem( item );
            });
      }

      // Init
      _self.init = function( items ){

          _self.instantiateItems( items );

          _self.currentItem = ko.observable( _self.items()[0] );

      }
      _self.init(items);

      // Called from ItemModel instance context,
      // this = binding context
      _self.incrementClick = function(){

          this.clicks(1+this.clicks());
      };

      // current Name, Click count
      _self.currentNameClicks = ko.computed(function(){

          return _self.currentItem().name() + ", clicks – " +_self.currentItem().clicks();
      });

      _self.setCurrent = function(index){
          _self.currentItem( this );
      }

  }

  ko.applyBindings( new AppViewModel(model.isAdmin, model.items));

})();
