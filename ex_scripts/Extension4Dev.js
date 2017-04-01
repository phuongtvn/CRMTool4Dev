var attributeObj=function(e,t,n,r){this.label=e,this.name=t,this.value=n,this.type=r},MyExtension=function(){var e,t,n,r,a=window.opener.Xrm,i={0:"Undefined",1:"Create",2:"Update",3:"Read Only",4:"Disabled",5:"Quick Create (Deprecated)",6:"Bulk Edit",11:"Read Optimized (Deprecated)"},l=function(e){var t=$(e).parents("ul").find("a")
if(t.length>0){for(var n=0;n<t.length;n++)t[n].className=t[n].className.replace("pure-button-primary","").trim()
e.classList.add("pure-button-primary")}},o=function(e,t,n){1==e?document.getElementById("tbInfo").removeAttribute("hidden"):document.getElementById("tbInfo").setAttribute("hidden","hidden"),1==t?document.getElementById("tbAttribute").removeAttribute("hidden"):document.getElementById("tbAttribute").setAttribute("hidden","hidden"),1==n?document.getElementById("tbOthers").removeAttribute("hidden"):document.getElementById("tbOthers").setAttribute("hidden","hidden")},s=function(e){if(null==e)return""
var t=e[0],n="Name: <b class='text-blue'>"+t.name+"</b><br/>ID: <b class='text-blue'>"+t.id.replace("{","").replace("}","")+"</b><br/>Entity: <b class='text-blue'>"+t.entityType+"</b>"
return n},u=function(e){if(null==e||null==e.getValue())return""
var t="Text: <b class='text-blue'>"+e.getText()+"</b><br/>Value: <b class='text-blue'>"+e.getValue()+"</b>"
return t},c=function(e){try{var t="<div class='pure-g'>",n=a.Page.getControl(e)
if(t+="<div class='pure-u-1-2'>",n&&"function"==typeof n.getDisabled){var r="<img id='lock-"+e+"' class='pure-img' style='cursor: pointer' src='../ex_imgs/{lock}.png' onclick=\"MyExtension.setDisable('"+e+"')\"/>"
r=r.replace("{lock}",1==n.getDisabled()?"lock16":"unlock16"),t+=r}if(t+="</div>",t+="<div class='pure-u-1-2'>",n&&"function"==typeof n.getVisible){var i="<img id='display-"+e+"' class='pure-img' style='cursor: pointer' src='../ex_imgs/{visible}.png' onclick=\"MyExtension.setVisible('"+e+"')\"/>"
i=i.replace("{visible}",1==n.getVisible()?"visible16":"invisible16"),t+=i}return t+="</div>",t+="</div>"}catch(l){return console.error(l.message),null}},d=function(e,t){return function(n,r){var a=t
return a&&null!=a||(a="label"),null==n[a]||""==n[a]?1:null==r[a]||""==r[a]?-1:n[a]===r[a]?0:e?n[a]<r[a]?-1:1:e?void 0:n[a]<r[a]?1:-1}},b=function(e,t,n){var r=this.text
return r.length<=2?!0:e.label.toLowerCase().indexOf(r.toLowerCase())>-1?!0:e.name.toLowerCase().indexOf(r.toLowerCase())>-1?!0:!1},g=function(e,t){for(var n=0;n<t.length;n++){var r=document.createElement("tr"),a=t[n]
for(var i in a){var l=document.createElement("td")
l.innerHTML=a[i],"name"==i&&(l.style.wordBreak="break-all"),r.appendChild(l)}e.appendChild(r)}},m=function(t){if(l(t),o(!0,!1,!1),!e){var n=document.getElementById("tbInfo").tBodies[0]
$(n).empty()
var r=[],s=a.Page.data.entity.getEntityName(),u=a.Page.data.entity.getId().replace("{","").replace("}",""),c=a.Page.context.getClientUrl(),d=c+"/main.aspx?etn="+s+"&pagetype=entityrecord&id=%7B"+u+"%7D"
r.push({name:"Entity Name",value:s}),r.push({name:"Form Type",value:i[a.Page.ui.getFormType()]}),r.push({name:"Record Url",value:"<a href='"+d+"' target='_blank'>"+d+"</a>"}),r.push({name:"User ID",value:a.Page.context.getUserId().replace("{","").replace("}","")}),r.push({name:"User Name",value:a.Page.context.getUserName()})
var b=a.Page.context.getUserRoles(),m="",p=""
for(var v in b)m+="RoleId eq guid'"+b[v]+"' or "
m=m.substr(0,m.length-3)
var f=c+"/XRMServices/2011/OrganizationData.svc/RoleSet?$select=RoleId,Name&$filter="+m
$.ajax({type:"GET",async:!1,contentType:"application/json; charset=utf-8",datatype:"json",url:f,beforeSend:function(e){e.setRequestHeader("Accept","application/json")},success:function(e,t,n){for(var r in e.d.results)p+="<b>"+e.d.results[r].Name+"</b> {"+e.d.results[r].RoleId+"}<br/>"},error:function(e,t,n){console.error("Cannot receive role info: "+n)}}),r.push({name:"User Roles",value:p}),e=r,g(n,r)}},p=function(e){if(l(e),o(!1,!0,!1),!t){var n=document.getElementById("tbAttribute").tBodies[0]
$(n).empty()
var r,i,b,m,p=[],v=a.Page.data.entity.attributes.getAll()
for(var f in v){var y=v[f]
i=y.getName()
var h=a.Page.getControl(i)
switch(m=null!=h&&"function"==typeof h.getLabel?h.getLabel():"",r=y.getAttributeType(),r.toLowerCase()){case"optionset":b=u(y)
break
case"lookup":b=s(y.getValue())
break
default:b=y.getValue()}var x=new attributeObj(m,i,b,r)
x.actions=c(i),p.push(x)}p.sort(d(!0)),t=p,g(n,p)}},v=function(e){l(e),o(!1,!1,!0)},f=function(){},y=function(e){clearTimeout(r),r=setTimeout(function(){var r
if(t){r=t.filter(b,{text:e.trim()})
var a=document.getElementById("tbAttribute").tBodies[0]
$(a).empty(),g(a,r),n=r}},500)},h=function(e){var t=a.Page.getControl(e),n=!t.getDisabled()
t.setDisabled(n)
var r=document.getElementById("lock-"+e),i=1==n?"lock16":"unlock16"
r.setAttribute("src","../ex_imgs/"+i+".png")},x=function(e){var t=a.Page.getControl(e),n=!t.getVisible()
t.setVisible(n)
var r=document.getElementById("display-"+e),i=1==n?"visible16":"invisible16"
r.setAttribute("src","../ex_imgs/"+i+".png")},I=function(e){console.log(e)
var r=e.getAttribute("col-data"),a=e.getAttribute("sort")
if(null!=r&&null!=a&&t){var i,l=document.getElementById("tbAttribute").tBodies[0]
i=n&&null!=n?n:t,i=i.sort(d("desc"==a.trim().toLowerCase(),r)),$(l).empty(),g(l,i),e.setAttribute("sort","asc"==a.trim().toLowerCase()?"desc":"asc")}}
return{tabInfo_Clicked:m,tabAttribute_Clicked:p,tabOthers_Clicked:v,btnSearch_Clicked:f,searchText_Changed:y,setDisable:h,setVisible:x,doSorting:I}}()
