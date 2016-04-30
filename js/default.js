window.GRM={}; // The gloabal GitiReadMe object

GRM.settings={};
GRM.articleMap = {};
GRM.addArticle=function(article){
	this.articleMap[article.name]=article;
	article.renderWell($("#grid"));
}
GRM.showArticle=function(article){
	$("#grid").hide();
	article.render($("#article"));
	$("#article").show();
}
GRM.showHome=function(){
	$("#article").hide();
	$("#grid").show();
}

function loadSettings(callback){
	$.get("conf/settings.yml", function (data) {
		GRM.settings = jsyaml.load(data);
		callback();
	});
}

function loadArticles(){
	var articleNames =  GRM.settings.articles;
	// for each article, get full info and rendering
	var base_url="";
	if(GRM.settings.type=="simple"){
		base_url=GRM.settings.server+"/articles/";
	}else{
		base_url="articles/"
	}
	$(articleNames).each(function (i, name) {
		var folderName = name.replace("/",":");
	 	$.get(base_url+folderName+"/meta.yml", function (data) {
	 		var articleMeta = jsyaml.load(data);
	 		articleMeta.name=name;
	 		var article = new Article(articleMeta)
	 		GRM.addArticle(article);
	 	});
	});
}
//Article Class 
var Article  = function(meta){
	var me = this;
	me.user= meta.name.split("/")[0]
	me.name= meta.name.split("/")[1];
	me.fullName = meta.name;
	$.each(meta.forks,function(index,fork){
		if (fork.owner == me.user){
			me.description = fork.description;
			me.stars = fork.stars;
			me.watches = fork.watches;
		}
	});
}


Article.prototype={
	renderWell:function($container){
		this.$elWell= $(Mustache.render($('#item-template').html(),this));
	    $container.append(this.$elWell);
	    this.bindWell();
	},
	bindWell:function(){
		var me =this;
		this.$elWell.find(".title").click(function(){
			GRM.showArticle(me);
			return false;
		});
	},
	render:function($container){
		this.$el= $(Mustache.render($('#article-template').html(),this));
		$container.append(this.$el);
		this.bind();
	},
	bind:function(){
		return;
	}
}

$(document).ready(function(){
	loadSettings(function(){
		loadArticles();
	})

});