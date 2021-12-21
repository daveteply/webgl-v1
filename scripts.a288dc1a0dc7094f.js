(function(){var S,H=[].slice;S=function(){var k,R,L,T,C;for(C=Array.isArray||function(t){return"[object Array]"==={}.toString.call(t)},h.SCHEMES={},R=0,L=(T="mono monochromatic contrast triade tetrade analogic".split(/\s+/)).length;R<L;R++)h.SCHEMES[T[R]]=!0;function h(){var t,e;for(t=[],e=1;e<=4;e++)t.push(new h.mutablecolor(60));this.col=t,this._scheme="mono",this._distance=.5,this._web_safe=!1,this._add_complement=!1}return h.PRESETS={default:[-1,-1,1,-.7,.25,1,.5,1],pastel:[.5,-.9,.5,.5,.1,.9,.75,.75],soft:[.3,-.8,.3,.5,.1,.9,.5,.75],light:[.25,1,.5,.75,.1,1,.5,1],hard:[1,-1,1,-.6,.1,1,.6,1],pale:[.1,-.85,.1,.5,.1,1,.1,.75]},h.COLOR_WHEEL={0:[255,0,0,100],15:[255,51,0,100],30:[255,102,0,100],45:[255,128,0,100],60:[255,153,0,100],75:[255,178,0,100],90:[255,204,0,100],105:[255,229,0,100],120:[255,255,0,100],135:[204,255,0,100],150:[153,255,0,100],165:[51,255,0,100],180:[0,204,0,80],195:[0,178,102,70],210:[0,153,153,60],225:[0,102,178,70],240:[0,51,204,80],255:[25,25,178,70],270:[51,0,153,60],285:[64,0,153,60],300:[102,0,153,60],315:[153,0,153,60],330:[204,0,153,80],345:[229,0,102,90]},h.prototype.colors=function(){var t,e,r,n,i,l,s,o,u,a;if(u=1,e=this.col[0].get_hue(),(t={mono:function(){},contrast:(a=this,function(){return u=2,a.col[1].set_hue(e),a.col[1].rotate(180)}),triade:function(a){return function(){var c;return u=3,c=60*a._distance,a.col[1].set_hue(e),a.col[1].rotate(180-c),a.col[2].set_hue(e),a.col[2].rotate(180+c)}}(this),tetrade:function(a){return function(){var c;return u=4,c=90*a._distance,a.col[1].set_hue(e),a.col[1].rotate(180),a.col[2].set_hue(e),a.col[2].rotate(180+c),a.col[3].set_hue(e),a.col[3].rotate(c)}}(this),analogic:function(a){return function(){var c;return u=a._add_complement?4:3,c=60*a._distance,a.col[1].set_hue(e),a.col[1].rotate(c),a.col[2].set_hue(e),a.col[2].rotate(360-c),a.col[3].set_hue(e),a.col[3].rotate(180)}}(this)}).monochromatic=t.mono,null==t[this._scheme])throw"Unknown color scheme name: "+this._scheme;for(t[this._scheme](),s=[],r=i=0,o=u-1;0<=o?i<=o:i>=o;r=0<=o?++i:--i)for(n=l=0;l<=3;n=++l)s[4*r+n]=this.col[r].get_hex(this._web_safe,n);return s},h.prototype.colorset=function(){var t,e;for(t=k(this.colors()),e=[];t.length>0;)e.push(t.splice(0,4));return e},h.prototype.from_hue=function(t){if(null==t)throw"from_hue needs an argument";return this.col[0].set_hue(t),this},h.prototype.rgb2ryb=function(){var t,e,r,n,i,l,s,o,u;return null!=(s=1<=arguments.length?H.call(arguments,0):[])[0]&&C(s[0])&&(s=s[0]),l=s[0],e=s[1],t=s[2],l-=o=Math.min(l,e,t),e-=o,t-=o,n=Math.max(l,e,t),l-=u=Math.min(l,e),e-=u,t>0&&e>0&&(t/=2,e/=2),u+=e,t+=e,(i=Math.max(l,u,t))>0&&(l*=r=n/i,u*=r,t*=r),l+=o,u+=o,t+=o,[Math.floor(l),Math.floor(u),Math.floor(t)]},h.prototype.rgb2hsv=function(){var t,e,r,n,i,l,s,o,a;return null!=(o=1<=arguments.length?H.call(arguments,0):[])[0]&&C(o[0])&&(o=o[0]),s=o[0],r=o[1],t=o[2],s/=255,r/=255,t/=255,l=Math.min.apply(Math,[s,r,t]),a=i=Math.max.apply(Math,[s,r,t]),(e=i-l)>0?(n=s===i?(r-t)/e:r===i?2+(t-s)/e:4+(s-r)/e,n*=60,[n%=360,e/i,a]):[0,0,a]},h.prototype.rgbToHsv=function(){var t,e,r,n,i,l,s,o,u,a;if(null!=(o=1<=arguments.length?H.call(arguments,0):[])[0]&&C(o[0])&&(o=o[0]),s=o[0],r=o[1],t=o[2],s/=255,r/=255,t/=255,n=void 0,u=void 0,a=i=Math.max(s,r,t),e=i-(l=Math.min(s,r,t)),u=0===i?0:e/i,i===l)n=0;else{switch(i){case s:n=(r-t)/e+(r<t?6:0);break;case r:n=(t-s)/e+2;break;case t:n=(s-r)/e+4}n/=6}return[n,u,a]},h.prototype.from_hex=function(t){var o,v,_,y,f,M;if(null==t)throw"from_hex needs an argument";if(!/^([0-9A-F]{2}){3}$/im.test(t))throw"from_hex("+t+") - argument must be in the form of RRGGBB";return y=/(..)(..)(..)/.exec(t).slice(1,4),v=function(){var x,d,b;for(b=[],d=0,x=y.length;d<x;d++)b.push(parseInt(y[d],16));return b}(),_=this.rgb2ryb([v[0],v[1],v[2]]),f=(o=this.rgbToHsv(_[0],_[1],_[2]))[1],M=o[2],this.from_hue(360*o[0]),this._set_variant_preset([f,M,f,.7*M,.25*f,1,.5*f,1]),this},h.prototype.add_complement=function(t){if(null==t)throw"add_complement needs an argument";return this._add_complement=t,this},h.prototype.web_safe=function(t){if(null==t)throw"web_safe needs an argument";return this._web_safe=t,this},h.prototype.distance=function(t){if(null==t)throw"distance needs an argument";if(t<0)throw"distance("+t+") - argument must be >= 0";if(t>1)throw"distance("+t+") - argument must be <= 1";return this._distance=t,this},h.prototype.scheme=function(t){if(null==t)return this._scheme;if(null==h.SCHEMES[t])throw"'"+t+"' isn't a valid scheme name";return this._scheme=t,this},h.prototype.variation=function(t){if(null==t)throw"variation needs an argument";if(null==h.PRESETS[t])throw"'$v' isn't a valid variation name";return this._set_variant_preset(h.PRESETS[t]),this},h.prototype._set_variant_preset=function(t){var e,r,n;for(n=[],e=r=0;r<=3;e=++r)n.push(this.col[e].set_variant_preset(t));return n},k=function(t){var e,r,n;if(null==t||"object"!=typeof t)return t;if(t instanceof Date)return new Date(t.getTime());if(t instanceof RegExp)return e="",null!=t.global&&(e+="g"),null!=t.ignoreCase&&(e+="i"),null!=t.multiline&&(e+="m"),null!=t.sticky&&(e+="y"),new RegExp(t.source,e);for(r in n=new t.constructor,t)n[r]=k(t[r]);return n},h.mutablecolor=function(){function t(e){if(null==e)throw"No hue specified";this.saturation=[],this.value=[],this.base_red=0,this.base_green=0,this.base_blue=0,this.base_saturation=0,this.base_value=0,this.set_hue(e),this.set_variant_preset(h.PRESETS.default)}return t.prototype.hue=0,t.prototype.saturation=[],t.prototype.value=[],t.prototype.base_red=0,t.prototype.base_green=0,t.prototype.base_saturation=0,t.prototype.base_value=0,t.prototype.get_hue=function(){return this.hue},t.prototype.set_hue=function(e){var r,n,i,l,s,o,u,a,c,m;for(n in r=function(v,_,y){return v+Math.round((_-v)*y)},this.hue=Math.round(e%360),m=(s=this.hue%15+(this.hue-Math.floor(this.hue)))/15,u=(15+(o=this.hue-Math.floor(s)))%360,360===o&&(o=0),360===u&&(u=0),i=h.COLOR_WHEEL[o],l=h.COLOR_WHEEL[u],a={red:0,green:1,blue:2,value:3})this["base_"+n]=r(i[c=a[n]],l[c],m);return this.base_saturation=r(100,100,m)/100,this.base_value/=100},t.prototype.rotate=function(e){return this.set_hue((this.hue+e)%360)},t.prototype.get_saturation=function(e){var r,n;return(r=(n=this.saturation[e])<0?-n*this.base_saturation:n)>1&&(r=1),r<0&&(r=0),r},t.prototype.get_value=function(e){var r,n;return(r=(n=this.value[e])<0?-n*this.base_value:n)>1&&(r=1),r<0&&(r=0),r},t.prototype.set_variant=function(e,r,n){return this.saturation[e]=r,this.value[e]=n},t.prototype.set_variant_preset=function(e){var r,n,i;for(i=[],r=n=0;n<=3;r=++n)i.push(this.set_variant(r,e[2*r],e[2*r+1]));return i},t.prototype.get_hex=function(e,r){var i,l,o,u,a,c,m,_,y,f,M,x,d,b;for(m=Math.max.apply(Math,function(){var w,p,g,E;for(E=[],p=0,w=(g=["red","green","blue"]).length;p<w;p++)E.push(this["base_"+(i=g[p])]);return E}.call(this)),Math.min.apply(Math,function(){var w,p,g,E;for(E=[],p=0,w=(g=["red","green","blue"]).length;p<w;p++)E.push(this["base_"+(i=g[p])]);return E}.call(this)),b=255*(r<0?this.base_value:this.get_value(r)),x=r<0?this.base_saturation:this.get_saturation(r),o=m>0?b/m:0,f=[],c=0,u=(y=["red","green","blue"]).length;c<u;c++)i=y[c],M=Math.min.apply(Math,[255,Math.round(b-(b-this["base_"+i]*o)*x)]),f.push(M);for(e&&(f=function(){var w,p,g;for(g=[],p=0,w=f.length;p<w;p++)g.push(51*Math.round(f[p]/51));return g}()),l="",_=0,a=f.length;_<a;_++)(d=f[_].toString(16)).length<2&&(d="0"+d),l+=d;return l},t}(),h}(),"undefined"!=typeof module&&null!==module&&null!=module.exports?module.exports=S:"function"==typeof define&&define.amd?define([],function(){return S}):window.ColorScheme=S}).call(this);