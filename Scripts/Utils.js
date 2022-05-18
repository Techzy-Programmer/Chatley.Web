var Dragger = (function()
{
	const TargetElem = $('.indicator'), DragElem = $('.chat');
	var Ran = false, StartY = 0, PrevY = 0, DownLimit = 0, Activable = true, CBActiver = null;

	function StartDrag(E)
	{
		E.preventDefault(); let CordsY = 0;
		if (E.type == "touchmove") CordsY = E.originalEvent.touches[0].clientY
		|| E.originalEvent.changedTouches[0].clientY; else CordsY = E.clientY;
		const MatrixInY = (parseInt(CordsY - StartY) + PrevY);
		if (CordsY > DownLimit || MatrixInY < -10) return;
		if (E.type == "touchmove") MoveBox(MatrixInY);
		else setTimeout(()=> MoveBox(MatrixInY), 100);
	}

	function MoveBox(DeltaChng)
	{
		TargetElem.css('box-shadow', 'inset 0 -2px 0 0 #ff762452, 0 0 5px');
		TargetElem.css('transform',	'matrix(1, 0, 0, 1, 0, ' + DeltaChng + ') scale(0.92)');
	}

	function ParseTransform(TStr)
	{
		let FinalObj = { }, TmpProp = '',
		TmpParamI = -1, PrevProp;

		for (let I = 0; I < TStr.length; I++)
		{
			const CharI = TStr.charAt(I);
			if (CharI == '(')
			{
				if (TmpProp) FinalObj[TmpProp] = null;
				else { return null; }
				PrevProp = TmpProp;
				TmpParamI = I;
				TmpProp = '';
			}
			else if (CharI == ')')
			{
				FinalObj[PrevProp] = BuildParam(TStr
					.substring(TmpParamI + 1, I));
				TmpParamI = -1;
			}
			else if (TmpParamI > -1) continue;
			else if ([' ', '"'].indexOf(CharI) == -1) TmpProp += CharI;
		}

		return FinalObj;
	}

	function BuildParam(ParamStr)
	{
		if (!ParamStr.indexOf(',') == -1) return parseFloat(ParamStr);
		else
		{
			const ArgsArray = [],
			EachArgs = ParamStr.split(',');
			for (let J = 0; J < EachArgs.length; J++)
				ArgsArray.push(parseFloat(EachArgs[J]));
			return ArgsArray;
		}
	}

	return {
		Initiate: function()
		{
			if (Ran) return; else Ran = true;
			TargetElem.css('transform', 'matrix(1, 0, 0, 1, 0, -40) scale(0.5)');
			document.onkeyup = (EUp) => EUp.key == '/' && $('.control-box input').focus();

			TargetElem.on('mousedown touchstart', (E) =>
			{
				if (E.type == "touchstart") StartY = E.originalEvent.touches[0].clientY
					|| E.originalEvent.changedTouches[0].clientY; else StartY = E.clientY;
				PrevY = new DOMMatrix(window.getComputedStyle(TargetElem[0]).transform).f;
				const Lim = (StartY - TargetElem[0].getBoundingClientRect().top);
				DownLimit = $('.chat').height() - (85 - Lim);
				DragElem.on('mousemove touchmove', StartDrag);
				UpperLimit = 40 + Lim;
			});

			DragElem.add(TargetElem).on('mouseup touchend', () =>
			{
				DragElem.off('mousemove touchmove', StartDrag);
				setTimeout(() =>
				{
					TargetElem.css('transform', 'matrix(1, 0, 0, 1, 0, ' +
					ParseTransform(TargetElem[0].style.transform)['matrix'][5] + ') scale(1)');
					TargetElem.css('box-shadow', 'inset 0 -2px 0 0 #d0ff0018, 0 0 5px');
				}, 200);
			});
		},

		Toggle : (Text = '') =>
		{
			if (Text)
			{
				if (TargetElem.css('opacity') == '0')
				{
					TargetElem.css('opacity', '1');
					TargetElem.css('transform', 'matrix(1, 0, 0, 1, 0, 0)');
				}
				
				if (Activable) TargetElem.find('b').text(Text);
				else CBActiver = () => TargetElem.find('b').text(Text);
			}
			else
			{
				if (TargetElem.css('opacity') == '0') return;
				else
				{
					Activable = false;
					TargetElem.css('opacity', '0');
					let MTransInY = ParseTransform(TargetElem[0].style.transform)['matrix'];
					if (!MTransInY) return; else MTransInY = MTransInY[5];
					TargetElem.css('transform', 'matrix(1, 0, 0, 1, 0, '
					+ (MTransInY -40) + ') scale(0.5)');

					setTimeout(() =>
					{
						TargetElem.css('transform', 'matrix(1, 0, 0, 1, 0, -40) scale(0.5)');
						setTimeout(() =>
						{
							if (typeof CBActiver == 'function')
							{
								CBActiver();
								CBActiver = null;
							}

							Activable = true;
							TargetElem.find('b').text('');
						}, 200);
					}, 200);
				}
			}
		}
	};
})();

// Full-Screen-Minified
var Fullscreen=(function(self){self.supported=('exitFullscreen' in document)||('mozCancelFullScreen' in document)||('webkitCancelFullScreen' in document)||('msExitFullScreen' in document);self.isFullscreen=!1;document.addEventListener("fullscreenchange",function(){if(document.fullscreenElement){self.isFullscreen=!0}else{self.isFullscreen=!1}},!1);document.addEventListener("mozfullscreenchange",function(){if(document.mozFullScreen){self.isFullscreen=!0}else{self.isFullscreen=!1}},!1);document.addEventListener("webkitfullscreenchange",function(){if(document.webkitIsFullScreen){self.isFullscreen=!0}else{self.isFullscreen=!1}},!1);document.addEventListener("MSFullscreenChange",function(){if(document.msFullscreenElement){self.isFullscreen=!0}else{self.isFullscreen=!1}},!1);self.goFullscreen=function(element,allowKeyboard){try{if(element.requestFullscreen){element.requestFullscreen()}else if(element.mozRequestFullScreen){element.mozRequestFullScreen()}else if(element.webkitRequestFullScreen){if(allowKeyboard){element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)}else{element.webkitRequestFullScreen()}}else if(element.msRequestFullScreen){element.msRequestFullScreen()}}catch(event){console.log("Element "+element+" cannot use fullscreen mode.")}};self.exitFullscreen=function(){if(document.exitFullscreen){document.exitFullscreen()}else if(document.mozCancelFullScreen){document.mozCancelFullScreen()}else if(document.webkitCancelFullScreen){document.webkitCancelFullScreen()}else if(document.msExitFullScreen){document.msExitFullScreen()}};return self})(Fullscreen||{});

// Toast-JS-Minified
(function(){function r(t,i){r.container||this.createContainer(),this.notify(t,i)}window.Toast=(r.prototype.notify=null,r.prototype.options=null,r.container=null,r.options={timelife:!0,delay:7,onShow:"spaceInDown",onHide:"spaceOutUp"},r.configureOptions=function(t){var i,n,o=r.options;if("object"!=typeof t)return o;for(i in t){if(n=t[i],void 0===o[i])throw"`"+i+"` option doesn't exist";o[i]=n}return o},r.prototype.getOption=function(t){return r.options[t]},r.prototype.setClasses=function(t){var i,n,o,e,s,a,r;if(!(t instanceof Object)){for(r=[],o=0,s=(a=t.split(" ")).length;o<s;o++)i=a[o],r.push(this.notify.classList.add(i));return r}for(n=0,e=t.length;n<e;n++)i=t[n],this.notify.classList.add(i)},r.prototype.notify=function(t,i){var n;this.notify=document.createElement("li"),this.notify.classList.add("toasts-notify"),this.notify.classList.add("magictime"),this.notify.classList.add(this.getOption("onShow")),this.notify.innerHTML=i,this.setClasses(t),this.getOption("timelife")&&((n=document.createElement("div")).classList.add("toasts-timelife"),this.notify.appendChild(n)),(n=new Date).setSeconds(n.getSeconds()+this.getOption("delay")),this.notify.timer=n;try{r.container.insertBefore(this.notify,r.container.firstChild)}catch(t){r.container.appendChild(this.notify)}return this.remove()},r.prototype.remove=function(){var o=this;return setTimeout(function(){var t,i,n=new Date;return n>=o.notify.timer?(o.notify.classList.contains("ondeHide")||(o.notify.classList.remove(o.getOption("onShow")),o.notify.classList.add(o.getOption("onHide"))),void o.notify.addEventListener(o.checkAnimations(),function(t){if(t.animationName===o.getOption("onHide"))return o.notify.remove()})):(o.getOption("timelife")&&(i=(t=o.notify.querySelector(".toasts-timelife")).clientWidth,n=n-o.notify.timer,n=Math.abs(n),n/=1e3,i-=i/(n=Math.round(n)),t.style.width=i+"px"),o.remove())},1e3)},r.prototype.checkAnimations=function(){var t,i,n={animation:"animationend",OAnimation:"oAnimationEnd",MozAnimation:"animationend",WebkitAnimation:"webkitAnimationEnd"};for(i in n)if(t=n[i],void 0!==this.notify.style[i])return t},r.prototype.createContainer=function(){var t=document.createElement("ul");return t.classList.add("toasts-container"),document.body.appendChild(t),r.container=t},r.guess=function(t,i){var n,o,e,s,a;for(t.classList.add("hide"),a=[],n=0,o=(s=t.childNodes).length;n<o;n++)3!==(e=s[n]).nodeType&&a.push(new r(e.classList,e.innerHTML));return a},r.setOptions=function(t){return r.options=r.configureOptions(t)},r)}).call(this);