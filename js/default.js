window.GRM={}; // The gloabal GitiReadMe object

GRM.settings={};
GRM.articleMap = {};
GRM.addArticle=function(article){
	this.articleMap[article.name]=article;
	article.renderWell($("#grid"));
}

GRM.showArticle=function(article){
	$("#list").hide();
	article.renderSider($("#sider"));
	article.showCommit();
	$("#article").show();
}
GRM.showHome=function(){
	$("#article").hide();
	$("#list").show();
}

function loadSettings(callback){
	$.get("conf/settings.yml", function (data) {
		GRM.settings = jsyaml.load(data);
		if(GRM.settings.type=="simple"){
			GRM.base_url=GRM.settings.server+"/articles/";
		}else{
			GRM.base_url="articles/"
		}		
		callback();
	});
}

function loadArticles(){
	var articleNames =  GRM.settings.articles;
	// for each article, get full info and rendering
	$(articleNames).each(function (i, name) {
		var folderName = name.replace("/",":");
	 	$.get(GRM.base_url+folderName+"/meta.yml", function (data) {
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
	me.folderName = meta.name.replace("/",":");
	$.each(meta.forks,function(index,fork){
		if (fork.owner == me.user){
			me.description = fork.description;
			me.stars = fork.stars;
			me.watches = fork.watches;
		}
	});
	$.each(meta.commits,function(index,commit){
		commit.shortId = commit.id.substring(0,10);
		commit.shortDate = commit.date.substring(0,10);
	});
	me.commits = meta.commits;
	me.forks = meta.forks;
	me.$content=$("#content");
	me.$sider=$("#sider");
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
	renderSider:function(){
		var me = this;
		me.$sider.empty();
		$.each(this.commits,function(index,commit){
			commit.$el= $(Mustache.render($('#article-sider-template').html(),commit));
			me.$sider.append(commit.$el);
		});
	    this.bindSider();
	},
	bindSider:function(){
		var me =this;
		$.each(this.commits,function(index,commit){
			commit.$el.find(".commit").click(function(){
				me.showCommit(commit);
				return false;
			});
		});
	},
	showCommit:function(commit){
		if(commit==undefined){
			commit = this.commits[0];
		}
		this.render(commit);
	},
	render:function(commit){
		var me = this;
		var model ={};
		model.article =this;
		model.commit=commit;
		if(commit.content){
			r();
		}else{
			$.get(GRM.base_url+me.folderName+"/"+commit.id+".md",function(data){
				commit.content=markdown.toHTML(data);
				r();
			});
		}
		function r(){
			commit.$el= $(Mustache.render($('#article-template').html(),model));
			me.$content.html(commit.$el);
			me.bind(commit);
		};
	},
	bind:function(commit){
		return;
	}
}

$(document).ready(function(){
	loadSettings(function(){
		loadArticles();
		GRM.showHome();
	})

});



$("#theme-select").find("a").click(function(){
	var theme = $(this).data("theme");
	var cssFile = "css/bootstrap.min.css";
	if (theme != "default"){
		cssFile = "css/bootstrap-"+theme+".min.css";
	}
	$("#theme-css").attr("href",cssFile);
	$("#theme-select").find("li").removeClass("active");
	$(this).parent().addClass("active");
	$(document).trigger("click");
	return false;
});
$("#brand").click(function(){
	GRM.showHome();
	return false;
});
