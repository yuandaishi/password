//1.canvas标签的宽高（如果设置大于父元素宽高中的最小值，则取最小值）
//2.图形形状
//3.每行包含多少个图形，应该设置一个上限和下限，小于多少的时候密码没有可靠性
//4.把每个图形当成一个对象，赋予属性（属性可以拓展，但是编号必须有，相当于dom）
//5.鼠标第一次进入图形的时候，链接中心点，并且把条件设置为false，第二次进入的时候，判断不触发
//6.设置密码的时候，把编号记录到对应的数组中
//6.每次进入的时候，把编号记录，验证的时候，根据标号是否对应得上，进行判断
//7.鼠标抬起时判断
//参数包裹：cancas宽度，图形形状，每行多少个图形，链接线条的颜色。正确显示的颜色，错误显示的颜色，划线时的颜色
;(function(){
	var psw=function(a){
		var _this=this;
		this.settings={
			id:"",
			width:200,
			geometry:"circle",
			num:3,
			bg_color:"black",
			link_line:"blue",//线条颜色
			set_line:"gold",//设置密码时线条颜色
			error_line:"red",//错误时线条颜色
			success_line:"green"//正确时线条颜色
		}
		this.extend(this.settings,a);
		var dom=document.getElementById(this.settings.id);
		var arr_wh=this.wid_hei(dom);
		this.draw_canvas(this.settings.width,arr_wh[0],arr_wh[1],dom,this.settings.bg_color);
		var canvas=dom.getElementsByTagName("canvas")[0];
		var ctx=canvas.getContext("2d");
		var arr_ctx=[];//用来保存链接的图形
		var con=false;
		var spot_cir=[];//用来保存每个链接的中心坐标
		var pass_arr=[];//用来保存设置密码的坐标
		var link_arr=[];//用来承接设置密码和验证密码
		var coor_arr=[];//用来保存验证密码的坐标
		var isCorrect=false;//密码是否正确
		var isSet=false;//是否正在设置图形密码
		for(var i=0;i<this.settings.num;i++){//画链接的图形
			for(var j=0;j<this.settings.num;j++){
				var k=this.settings.width/this.settings.num
				var x=k*i+k/2;
				var y=k*j+k/2;
				var ctx_obj=this.create_ctx_obj();
				ctx_obj["geo"]=this.settings.geometry;//以数组形式读取的话，则有引号字符串，而点的话，则直接加属性
				ctx_obj["x"]=x;
				ctx_obj["y"]=y;
				ctx_obj["r"]=k/2-10;
				arr_ctx.push(ctx_obj);
			}
		}
		arr_ctx.forEach(function(e){//绘制图形
			e.draw(ctx);//this会指向window
		})
		var set_dom=document.getElementById("set");
		var save_dom=document.getElementById("save");
		set_dom.onclick=function(){//设置图形时触发函数
			_this.set_color(canvas,"pink");
			ctx.clearRect(0,0,canvas.clientWidth,canvas.clientWidth);//清屏
			arr_ctx.forEach(function(e){//绘制图形
				e.draw(ctx);//this会指向window
			})
			isSet=true;
			pass_arr.length=0;//密码置空
			coor_arr.length=0;//验证密码置空
			for(var i=0;i<arr_ctx.length;i++){//重置arr_ctx[i].con
				arr_ctx[i].con=false;
			}
		}
		save_dom.onclick=function(){//保存密码时
			_this.set_color(canvas,_this.settings.bg_color);//重置背景色
			ctx.clearRect(0,0,canvas.clientWidth,canvas.clientWidth);//清屏
			arr_ctx.forEach(function(e){//绘制图形
				e.draw(ctx);//this会指向window
			})
			isSet=false;
			setTimeout(function(){
				alert("图形密码设置成功")
			},200)
		}
		canvas.addEventListener("mousedown",function(e){//鼠标按下时，绑定一个function
			if(isSet){
				pass_arr.length=0//设置密码置空
				ctx.clearRect(0,0,canvas.clientWidth,canvas.clientWidth);//清屏
				arr_ctx.forEach(function(e){//绘制图形
					e.draw(ctx);//this会指向window
				})
			}else{
				coor_arr.length=0;//验证密码置空
			}
			var x=e.offsetX;
			var y=e.offsetY;
			for(var i=0;i<arr_ctx.length;i++){
				var abs_diff=(x-arr_ctx[i].x)*(x-arr_ctx[i].x)+(y-arr_ctx[i].y)*(y-arr_ctx[i].y);
				var r_abs=arr_ctx[i].r*arr_ctx[i].r;
				if(abs_diff<r_abs&&(!arr_ctx[i].con)){//在任意圆形内部时,并且是第一次移入的圆
					//console.log("haha")
					con=true;//mousemove触发函数的条件
					arr_ctx[i].con=true;//表示该链接点鼠标已经进入过一次
					spot_cir=[arr_ctx[i].x,arr_ctx[i].y];
					if(isSet){//如果是设置密码状态
						pass_arr.push(spot_cir)
					}else{
						coor_arr.push(spot_cir);	
					}
					_this.draw_spot(ctx,spot_cir);
					return;//不在执行循环操作，减少计算时间,并且for语句外面的语句也不执行
				}
			}
		});
		canvas.addEventListener("mouseup",function(e){//会重新绘制图形，主要是为了剪掉多余的线段
			isCorrect=false;
			con=false;
			ctx.clearRect(0,0,canvas.clientWidth,canvas.clientWidth);//清屏了
			for(var i=0;i<arr_ctx.length;i++){//重置arr_ctx[i].con
				arr_ctx[i].con=false;
			}
			arr_ctx.forEach(function(e){//绘制图形
				e.draw(ctx);//this会指向window
			})
			if(link_arr.length==0){//如果一开始并没有的验证的点的话，则直接返回
				return;
			}
			_this.draw_spot(ctx,link_arr[0]);
			ctx.beginPath();
			ctx.moveTo(link_arr[0][0],link_arr[0][1]);
			for(var i=1;i<link_arr.length;i++){//循环画出所有的线段，剪掉多余的线段
				ctx.lineTo(link_arr[i][0],link_arr[i][1]);
			}
			console.log(pass_arr);
			console.log(coor_arr);
			if(pass_arr.length==coor_arr.length){//密码数组长度相等，密码才有可能相等
				for(var i=0;i<pass_arr.length;i++){
					if(pass_arr[i][0]===coor_arr[i][0]&&pass_arr[i][1]===coor_arr[i][1]){//前面数组设计的更合理一点，判断应该更简单
						isCorrect=true;
					}else{
						isCorrect=false;
						break;
					}
				}		
			}
			
			console.log(isCorrect)
			if(isCorrect){//如果密码正确的话，线条颜色
				ctx.strokeStyle=_this.settings.success_line;
				str="密码正确";
			}else{//错误的话，线条颜色
				ctx.strokeStyle=_this.settings.error_line;
				if(pass_arr.length==0){
					str="请先设置密码"
				}else{
					str="密码错误"
				}
			}
			if(isSet){//如果是设置密码的状态
				ctx.strokeStyle=_this.settings.set_line;
				ctx.lineWidth=5;
				ctx.stroke();
				for(var i=1;i<link_arr.length;i++){//循环画出所有的点,点和线段写在一个循环里面，相互之间会影响，所以只能分开写
					_this.draw_spot(ctx,link_arr[i]);
				}
				return;//直接返回，不清屏
			}
			ctx.lineWidth=5;
			ctx.stroke();
			for(var i=1;i<link_arr.length;i++){//循环画出所有的点,点和线段写在一个循环里面，相互之间会影响，所以只能分开写
				_this.draw_spot(ctx,link_arr[i]);
			}
			setTimeout(function(){//清屏了,并没有等待之前绘制完成，不知道是为什么,所以只能用setTimeout实现
				ctx.clearRect(0,0,canvas.clientWidth,canvas.clientWidth);
				arr_ctx.forEach(function(e){//绘制图形
					e.draw(ctx);//this会指向window
				})
				alert(str);
			},300)
		})
		canvas.addEventListener("mousemove",function(e){
			if(con){
				var x=e.offsetX;
				var y=e.offsetY;
				//console.log(k)
				ctx.clearRect(0,0,canvas.clientWidth,canvas.clientWidth);//清屏了，所以所有图形都要重新绘制，感觉应该有更好的方法才对
				arr_ctx.forEach(function(e){//绘制图形
					e.draw(ctx);//this会指向window
				})
				//console.log(i)//这个i会逐层往外寻找，最后找到的是(for(var i=0;i<this.settings.num;i++){)这里的i，所以是3
				for(var i=0;i<arr_ctx.length;i++){
					var abs_diff=(x-arr_ctx[i].x)*(x-arr_ctx[i].x)+(y-arr_ctx[i].y)*(y-arr_ctx[i].y);
					var r_abs=arr_ctx[i].r*arr_ctx[i].r;
					if(abs_diff<r_abs&&(!arr_ctx[i].con)){//在另外一个圆形内部时,才触发移动的条件
						//console.log("hehe");
						spot_cir=[arr_ctx[i].x,arr_ctx[i].y]
						if(isSet){//如果是设置密码状态（代码耦合太多了，修改起来复杂。别人也不容易看懂）,在这里判断，主要是为了减少代码量。在for之前判断的话，只需要判断一次，在这里，每次for循环都要判断
							pass_arr.push(spot_cir);
						}else{
							coor_arr.push(spot_cir);
						}
						arr_ctx[i].con=true;//表示该圆形也被鼠标移入过
					}
				}
				//console.log(coor_arr)
				if(isSet){//过渡两种状态
					link_arr=pass_arr;
				}else{
					link_arr=coor_arr;
				}
				ctx.beginPath();
				ctx.moveTo(link_arr[0][0],link_arr[0][1]);
				for(var i=1;i<link_arr.length;i++){//循环画出所有的线段
					ctx.lineTo(link_arr[i][0],link_arr[i][1]);
				}
				ctx.lineTo(x,y);
				ctx.strokeStyle=_this.settings.link_line;
				ctx.lineWidth=5;
				ctx.stroke();
				for(var i=0;i<link_arr.length;i++){//循环画出所有的点,点和线段写在一个循环里面，相互之间会影响，所以只能分开写
					_this.draw_spot(ctx,link_arr[i]);
				}
			}
		})
	}
	psw.prototype={
		extend:function(a,b){//参数替换
			if(b instanceof Object&&!(b instanceof Array)){//传入的是对象，但不是数组
				for(var key in b){
					if(a[key]!==undefined){
						a[key]=b[key];
					}
				}
			}else{
				throw "请传入一个对象作为参数"
			}
		},
		draw_canvas:function(a,b,c,d,e){//创建canvas标签
			var true_w=Math.min(a,b,c);
			//console.log(true_w);
			var canvas=document.createElement("canvas");
			var style_str="vertical-align: middle;background:"+e+";";
			canvas.setAttribute("style",style_str);//在style设置宽高的话会变形
			canvas.setAttribute("width",true_w);
			canvas.setAttribute("height",true_w);
			d.appendChild(canvas);
		},
		wid_hei:function(a){//获取box的宽高
			var width=a.clientWidth;
			var height=a.clientHeight;
			return [width,height];
		},
		create_ctx_obj:function(){//创建链接点canvas图形对象
			var ctx_obj={//封装成对象，有利于以后属性的拓展
					geo:"circle",//形状
					x:"",//初始横坐标
					y:"",//初始纵坐标
					r:"",//半径
					lineWidth:1,//线宽
					strokeStyle:"black",//渲染颜色
					con:false//鼠标是否曾经经过
				}
				ctx_obj.__proto__.draw=function(a){//兼容性没有测试，貌似一些浏览器不支持
					if(this.geo=="circle"){
						a.beginPath();
						a.lineWidth=this.lineWidth;
						a.strokeStyle=this.strokeStyle;
						a.arc(this.x,this.y,this.r,0,Math.PI*2,true);
						a.stroke();
					}
				}
			return ctx_obj;
		},
		set_color:function(a,b){//点击设置时，背景色颜色改变
			a.style.background=b;
		},
		draw_spot:function(a,b){
			a.beginPath();
			a.arc(b[0],b[1],10,0,Math.PI*2,false);
			a.fillStyle="#004400"
			a.fill();
		}
	}
	window.psw=psw;
})()
