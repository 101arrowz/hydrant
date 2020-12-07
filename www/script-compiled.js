var table,virtual_active=!1,hass_active=!1,hass_a_active=!1,hass_h_active=!1,hass_s_active=!1,ci_h_active=!1,ci_hw_active=!1,conflicts_active=!1,remote_active=!1,no_ci_active=!1,rest_active=!1,lab_active=!1,final_active=!1,under_active=!1,grad_active=!1,units_active=!1,cur_class,cur_classes=[],options,cur_option=0,cur_min_conflicts=0,all_sections,calc_classes=[],calc_slots=[],conflicts_flag,activity_times=[],activity_times_raw=[],activities=[],locked_slots={},gcal_slots=[],new_css=!1,dark_mode=!1,
colors="#16A085 #3E9ED1 #AE7CB4 #CA434B #E4793C #D7AD00 #27AE60 #F08E94 #8FBDD9 #A2ACB0".split(" "),colors_dark="#36C0A5 #5EBEF1 #CE9CD4 #EA636B #FF995C #F7CD20 #47CE80 #FFAEB4 #AFDDF9 #C2CCD0".split(" ");Number.prototype.format=function(a,b){b="\\d(?=(\\d{"+(b||3)+"})+"+(0<a?"\\.":"$")+")";return this.toFixed(Math.max(0,~~a)).replace(new RegExp(b,"g"),"$&,")};String.prototype.paddingLeft=function(a){return String(a+this).slice(-a.length)};
String.prototype.paddingRight=function(a){return String(this+a).slice(0,a.length)};Storage.prototype.setObj=function(a,b){return this.setItem(a,JSON.stringify(b))};Storage.prototype.getObj=function(a){return JSON.parse(this.getItem(a))};
var course_rank={1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,11:11,12:12,14:14,15:15,16:16,17:17,18:18,20:20,21:21,"21A":22,"21G":23,"21H":24,"21L":25,"21M":26,"21W":27,22:30,24:31,AS:32,CC:33,CMS:34,CSB:35,EC:36,EM:37,ES:38,ESD:39,HST:40,IDS:41,MS:42,MAS:43,NS:44,OR:45,RED:46,SCM:47,SP:48,STS:49,WGS:50};function id_sanitize(a){return a.replace(/\W/g,"")}function escapeRegExp(a){return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&")}
function class_sort_internal(a,b){cr_a=course_rank[a];cr_b=course_rank[b];return cr_a<cr_b||void 0===cr_b?-1:cr_a>cr_b||void 0===cr_a?1:0}function class_sort_internal2(a,b){if(a.length<b.length){var c=-1;var d=a.length}else a.length>b.length?(c=1,d=b.length):(c=0,d=a.length);for(i=0;i<d;i++){if(a.charAt(i)<b.charAt(i))return-1;if(a.charAt(i)>b.charAt(i))return 1}return c}
function class_sort(a,b){a=a.split(".");b=b.split(".");var c=class_sort_internal(a[0],b[0]);0===c&&(c=class_sort_internal2(a[1],b[1]));return c}jQuery.extend(jQuery.fn.dataTableExt.oSort,{"class-asc":function(a,b){return class_sort(a,b)},"class-desc":function(a,b){return-1*class_sort(a,b)}});
function search_setup(){$("#class-input").on("keyup",function(){table.search()!==this.value&&(-1!==this.value.indexOf(".")?table.search("^"+escapeRegExp(this.value),!0,!1,!0).draw():table.search(this.value,!1,!0,!0).draw())})}function expand_type(a){return"l"==a?"lec":"r"==a?"rec":"b"==a?"lab":""}
function add_cal(a,b,c,d,e){var f=Math.floor(d/30)+1,g=(Math.floor(d%30/2)+8).toString().paddingLeft("00"),h=(d%2*30).toString().paddingLeft("00"),l=(Math.floor((d+e)%30/2)+8).toString().paddingLeft("00");d=((d+e)%2*30).toString().paddingLeft("00");e=expand_type(b);gcal_slots.push([f-1,g+":"+h,l+":"+d,a+" "+e,c]);var k=cur_classes.indexOf(a);b=colors[k%colors.length];c={title:a+" "+e+"\n"+c,start:"2016-08-0"+f+"T"+g+":"+h,end:"2016-08-0"+f+"T"+l+":"+d,backgroundColor:b,borderColor:colors_dark[k%colors_dark.length]};
$("#calendar").fullCalendar("renderEvent",c,!0);a=id_sanitize(a);$("#"+a+"-button").css({"background-color":b,"border-color":b,color:"#ffffff"})}function conflict_check(a,b){return a[0]<b[0]+b[1]&&b[0]<a[0]+a[1]}
function select_helper(a,b,c,d,e){var f=[];if(0==a.length)return[[c],d];var g,h=a.slice();h.shift();a=a[0];a=classes[a[0]][a[1]];for(var l=0;l<a.length;l++){var k=a[l][0];for(var m=g=0;m<b.length;m++)for(var n=0;n<k.length;n++)conflict_check(k[n],b[m])&&g++;d+g>e||(k=select_helper(h,b.concat(k),c.concat(l),d+g,e),k[1]<e&&(f=[],e=k[1]),k[1]==e&&(f=f.concat(k[0])))}return[f,e]}
function select_slots(){for(var a=[],b=0;b<cur_classes.length;b++)for(var c=0;c<classes[cur_classes[b]].s.length;c++)a.push([classes[cur_classes[b]].no,classes[cur_classes[b]].s[c]]);a.sort(function(a,b){return classes[a[0]][a[1]].length-classes[b[0]][b[1]].length});all_sections=[];b=[];c=[];for(var d=[],e=0;e<a.length;e++){var f=a[e];f in locked_slots?"none"!=locked_slots[f]&&(all_sections.push(f),b.push(locked_slots[f]),c=c.concat(classes[f[0]][f[1]][locked_slots[f]][0])):d.push(f)}all_sections=
all_sections.concat(d);a=select_helper(d,c,[],0,1E3);for(c=0;c<a[0].length;c++)a[0][c]=b.concat(a[0][c]);options=a[0];cur_min_conflicts=a[1];set_option(0);$("#cal-options-2").text(options.length);15<=options.length?($("#warning3-div").show(),$("#buttons-div").css("margin","10 auto")):($("#warning3-div").hide(),$("#buttons-div").css("margin","20 auto"));d=c=0;f=e=!1;for(b=0;b<cur_classes.length;b++){var g="";a=id_sanitize(cur_classes[b]);c+=classes[cur_classes[b]].u1+classes[cur_classes[b]].u2+classes[cur_classes[b]].u3;
d+=classes[cur_classes[b]].h;0===classes[cur_classes[b]].h&&"a"!=classes[cur_classes[b]].s[0]&&(g+="*",e=!0,d+=classes[cur_classes[b]].u1+classes[cur_classes[b]].u2+classes[cur_classes[b]].u3);classes[cur_classes[b]].tb&&(g+="+",f=!0);$("#"+a+"-button").text(cur_classes[b]+g)}$("#total-units").text(c);$("#total-hours").text(d.format(1));e?($("#total-hours").append("*"),$("#warning-div").show()):$("#warning-div").hide();f?$("#warning2-div").show():$("#warning2-div").hide();localStorage.setObj("spring21_cur_classes",
cur_classes)}function set_option(a){var b=options[a];$("#calendar").fullCalendar("removeEvents");gcal_slots=[];for(var c=0;c<b.length;c++){var d=all_sections[c][0],e=all_sections[c][1];var f=classes[d][e][b[c]];for(var g=f[1],h=0;h<f[0].length;h++)add_cal(d,e,g,f[0][h][0],f[0][h][1])}cur_option=a;$("#cal-options-1").text(cur_option+1);localStorage.setObj("spring21_cur_option",cur_option);set_css(new_css);set_dark_mode(dark_mode)}
function conflict_helper(a,b){var c=0;a:for(;c<a.length;c++){var d=a[c];d=classes[d[0]][d[1]];var e=0;b:for(;e<d.length;e++){slot=d[e][0];for(var f=0;f<b.length;f++)for(var g=0;g<slot.length;g++)if(conflict_check(slot[g],b[f]))continue b;continue a}return!1}return!0}
function is_selected(a){var b=!1;if(hass_active||hass_a_active||hass_h_active||hass_s_active)if((hass_active||hass_a_active)&&classes[a].ha&&(b=!0),(hass_active||hass_h_active)&&classes[a].hh&&(b=!0),(hass_active||hass_s_active)&&classes[a].hs&&(b=!0),hass_active&&classes[a].he&&(b=!0),!b)return!1;b=!1;if(virtual_active&&!classes[a].v)return!1;if(ci_h_active||ci_hw_active)if(ci_h_active&&classes[a].ci&&(b=!0),ci_hw_active&&classes[a].cw&&(b=!0),!b)return!1;if(no_ci_active&&(classes[a].ci||classes[a].cw)||
rest_active&&!classes[a].re||lab_active&&!classes[a].la&&!classes[a].pl||final_active&&classes[a].f||units_active&&9<classes[a].u1+classes[a].u2+classes[a].u3)return!1;if(under_active||grad_active)if(b=!1,under_active&&"U"==classes[a].le&&(b=!0),grad_active&&"G"==classes[a].le&&(b=!0),!b)return!1;if(conflicts_active){if(!conflicts_flag){calc_classes=cur_classes.slice();calc_slots=[];for(var c=0;c<options.length;c++){b=options[c];var d=[];for(var e=0;e<b.length;e++)d.push.apply(d,classes[all_sections[e][0]][all_sections[e][1]][b[e]][0]);
calc_slots.push(d)}conflicts_flag=!0}if(0==cur_classes.length)return!0;b=[];for(d=0;d<classes[a].s.length;d++)b.push([classes[a].no,classes[a].s[d]]);if(0==b.length)return!1;for(a=0;a<calc_slots.length;a++)if(conflict_helper(b,calc_slots[a]))return!0;return!1}return!0}function fill_table(){table.clear();conflicts_flag=!1;for(var a in classes)is_selected(a)&&table.rows.add([[classes[a].no,classes[a].ra.format(1),classes[a].h.format(1),classes[a].n]]);table.draw()}
function link_classes(a,b){var c=a.split(" "),d;for(d in c){var e=c[d];a="";-1!=e.indexOf(",")&&(a+=",",e=e.replace(",",""));-1!=e.indexOf(";")&&(a+=";",e=e.replace(";",""));if(e in classes){var f=id_sanitize(e);$("#class-"+b).append('<span class="link-span" id="'+b+"-"+f+'">'+e+"</span>"+a+" ");(function(){var a=e;$("#"+b+"-"+f).click(function(){class_desc(a)})})()}else $("#class-"+b).append(e+a+" ")}}
function class_desc(a){$("#class-name").text(classes[a].no+": "+classes[a].n);$(".type-span").hide();classes[a].nx&&$("#nonext-span").show();"U"==classes[a].le?$("#under-span").show():"G"==classes[a].le&&$("#grad-span").show();-1!=classes[a].t.indexOf("FA")&&$("#fall-span").show();-1!=classes[a].t.indexOf("JA")&&$("#iap-span").show();-1!=classes[a].t.indexOf("SP")&&$("#spring-span").show();-1!=classes[a].t.indexOf("SU")&&$("#summer-span").show();$("#end-paren-span").show();classes[a].rp&&$("#repeat-span").show();
classes[a].re&&$("#rest-span").show();classes[a].la&&$("#Lab-span").show();classes[a].pl&&$("#PartLab-span").show();classes[a].hh&&$("#hassH-span").show();classes[a].ha&&$("#hassA-span").show();classes[a].hs&&$("#hassS-span").show();classes[a].he&&$("#hassE-span").show();classes[a].ci&&$("#cih1-span").show();classes[a].cw&&$("#cihw-span").show();var b=classes[a].u1,c=classes[a].u2,d=classes[a].u3;classes[a].f&&$("#final-span").show();$("#class-prereq").html("Prereq: ");link_classes(classes[a].pr,
"prereq");try{$("#class-same").html("<br>Same class as "),""!=classes[a].sa?(link_classes(classes[a].sa,"same"),$("#class-same").show()):$("#class-same").hide(),$("#class-meets").html("<br>Meets with "),""!=classes[a].mw?(link_classes(classes[a].mw,"meets"),$("#class-meets").show()):$("#class-meets").hide()}catch(e){$("#class-same").hide(),$("#class-meets").hide()}$("#class-units").text(b+c+d+" units: "+b+"-"+c+"-"+d);0!=classes[a].ra?($("#class-rating").text(classes[a].ra.format(1)),$("#class-hours").text(classes[a].h.format(1)),
$("#class-people").text(classes[a].si.format(1)),$("#out-of-rating").show()):($("#class-rating").text("N/A"),$("#class-hours").text("N/A"),$("#class-people").text("N/A"),$("#out-of-rating").hide());$("#class-eval").show();$("#class-desc").html(classes[a].d+"<br><br>");""!=classes[a].u&&$("#class-desc").append('<a href="'+classes[a].u+'" target="_blank">More info</a> | ');""!=classes[a].i&&$("#class-desc").append("<em>In-charge: "+classes[a].i+"</em><br><br>");$("#class-desc").append('<a href="http://student.mit.edu/catalog/search.cgi?search='+
a+'" target="_blank">Course Catalog</a> | <a href="https://sisapp.mit.edu/ose-rpt/subjectEvaluationSearch.htm?search=Search&subjectCode='+a+'" target="_blank">Class Evaluations</a>');"6"===classes[a].co&&$("#class-desc").append(' | <a href="https://underground-guide.mit.edu/search?q='+a+'" target="_blank">HKN Underground Guide</a>');cur_class=a;n_number=id_sanitize(a);-1==cur_classes.indexOf(a)?($("#class-buttons-div").html('<button type="button" class="btn btn-primary" id='+n_number+"-add-button>Add class</button>"),
$("#"+n_number+"-add-button").click(function(){add_class(a)}),$("#manual-button").hide()):($("#class-buttons-div").html('<button type="button" class="btn btn-primary" id='+n_number+"-remove-button>Remove class</button>"),$("#"+n_number+"-remove-button").click(function(){remove_class(a)}),1==classes[a].s.length&&"a"==classes[a].s[0]&&($("#class-buttons-div").append('<button type="button" class="btn btn-primary" id='+n_number+"-edit-button>Edit activity</button>"),$("#"+n_number+"-edit-button").click(function(){activity_times=
classes[a].at;activity_times_raw=classes[a].atr;activity_timeslot_close();$("#activity-input").val(classes[a].no);$("#activity-hours-input").val(classes[a].h);$("#activity-modal").modal("show")})),$("#manual-button").text("+ Manually set sections"),$("#manual-button").show());$("#manual-div").hide();-1!=classes[a].s.indexOf("a")?($("#flags-div").hide(),$("#class-name").text(classes[a].no)):$("#flags-div").show()}
function add_class(a){var b=id_sanitize(a);$("#selected-div").append('<button type="button" class="btn btn-primary" id='+b+"-button>"+a+"</button>");sortable(".sortable");sortable_listener();$("#"+b+"-button").click(function(){class_desc(a)});$("#"+b+"-button").dblclick(function(){remove_class(a)});cur_classes.push(a);try{class_desc(a)}catch(c){}select_slots();$("#units-div").show()}
function remove_class(a){var b=id_sanitize(a);$("#"+b+"-button").remove();cur_classes.splice(cur_classes.indexOf(a),1);class_desc(a);0==cur_classes.length?(options=[[]],cur_option=0,$("#cal-options-1").text("1"),$("#cal-options-2").text("1"),$("#calendar").fullCalendar("removeEvents"),$("#units-div").hide(),$("#warning-div").hide(),$("#warning2-div").hide(),localStorage.setObj("spring21_cur_classes",cur_classes),localStorage.setObj("spring21_cur_option",cur_option)):select_slots()}
function activity_timeslot_close(){$("#activity-times").html("");for(var a in activity_times_raw){var b="remove-activity-"+a;$("#activity-times").append('<button type="button" id="'+b+'" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>'+activity_times_raw[a]+"<br>");$("#"+b).click(function(){activity_times.splice(a,1);activity_times_raw.splice(a,1);activity_timeslot_close()})}}
function add_activity_time(){var a=[$("#act-mon").is(":checked"),$("#act-tue").is(":checked"),$("#act-wed").is(":checked"),$("#act-thu").is(":checked"),$("#act-fri").is(":checked")],b=["Mon","Tue","Wed","Thu","Fri"],c=$("#start-time").timepicker("getSecondsFromMidnight")/1800-16,d=$("#end-time").timepicker("getSecondsFromMidnight")/1800-16;if(!(c>=d)){for(var e=0;5>e;e++)if(a[e]){var f=b[e]+", "+$("#start-time").val()+" - "+$("#end-time").val();-1==activity_times_raw.indexOf(f)&&(activity_times.push([30*
e+c,d-c]),activity_times_raw.push(f))}activity_timeslot_close()}}
function add_activity(){add_activity_time();var a=$("#activity-input").val(),b=$("#activity-hours-input").val();a in classes&&(1!=classes[a].s.length||"a"!=classes[a].s[0])?($("#activity-input").popover("show"),setTimeout(function(){$("#activity-input").popover("hide")},3500)):isNaN(b)?($("#activity-hours-input").popover("show"),setTimeout(function(){$("#activity-hours-input").popover("hide")},3500)):(set_activity(a,activity_times,activity_times_raw,Number(b)),-1==cur_classes.indexOf(a)?add_class(a):
select_slots(),$("#activity-modal").modal("hide"))}function set_activity(a,b,c,d){b={no:a,co:"",cl:"",f:!1,tb:!1,s:["a"],a:[[b,""]],hh:!1,ha:!1,hs:!1,he:!1,ci:!1,cw:!1,rp:!1,re:!1,la:!1,pl:!1,u1:0,u2:0,u3:0,le:"U",t:["SP"],sa:"",mw:"",u:"",i:"",v:!1,pr:"None",d:"Your activity!",n:a,ra:0,h:d,si:0,at:b,atr:c};activities.push(b);classes[a]=b;localStorage.setObj("spring21_activities",activities)}
function calendar_export(){null!=gapi.auth2.getAuthInstance()&&gapi.auth2.getAuthInstance().isSignedIn.get()?calendar_send(!0):gapi.client.init({apiKey:"AIzaSyC_ALyKTv8OvcaBXlJU1u3ifJoeQVCY45Q",discoveryDocs:["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],clientId:"770500080614-drje51h0h8hlsfra9s4cv93vb9omm220.apps.googleusercontent.com",scope:"https://www.googleapis.com/auth/calendar"}).then(function(){return gapi.auth2.getAuthInstance().signIn()}).then(function(){calendar_send(gapi.auth2.getAuthInstance().isSignedIn.get())})}
function calendar_send(a){a&&($("#calendar-link").text("Working..."),gapi.client.calendar.calendarList.list({}).then(function(a){var b=[],d;for(d in a.result.items)"Firehose: Spring 2021"==a.result.items[d].summary&&b.push(a.result.items[d].id);for(d in b)gapi.client.calendar.calendars.delete({calendarId:b[d]}).then();return gapi.client.calendar.calendars.insert({summary:"Firehose: Spring 2021"})}).then(function(a){a=a.result.id;gapi.client.calendar.calendarList.get({calendarId:a}).then(function(a){var b=
a.result;a.result.backgroundColor="#DB5E45";gapi.client.calendar.calendarList.update({calendarId:a.result.id,colorRgbFormat:!0,resource:b}).then()});var b=["2021-02-22","2021-02-16","2021-02-17","2021-02-18","2021-02-19"],d=["20210524","20210525","20210526","20210527","20210521"],e=[["20210308","20210322","20210419"],["20210323","20200420"],["20210526"],["20200527"],["20210507"]],f=gapi.client.newBatch(),g;for(g in gcal_slots){var h=gcal_slots[g],l="",k="T"+h[1].replace(":","")+"00,",m;for(m in e[h[0]])l+=
e[h[0]][m]+k;f.add(gapi.client.calendar.events.insert({calendarId:a,resource:{summary:h[3],location:h[4],start:{dateTime:b[h[0]]+"T"+h[1]+":00",timeZone:"America/New_York"},end:{dateTime:b[h[0]]+"T"+h[2]+":00",timeZone:"America/New_York"},recurrence:["RRULE:FREQ=WEEKLY;UNTIL="+d[h[0]],"EXDATE;TZID=America/New_York:"+l]}}))}return f}).then(function(a){window.open("https://calendar.google.com","_blank");$("#calendar-link").html('<img src="img/calendar-button.svg" />')}))}
function clipboard_export(){for(var a=[],b=options[cur_option],c=0;c<b.length;c++){var d=all_sections[c][0],e=all_sections[c][1];if("a"!=e){slots=classes[d][e][b[c]];var f=slots[1],g=classes[d][e+"r"][b[c]];a.push([d,(d+" "+expand_type(e)).paddingRight("             ")+f.paddingRight("         ")+g])}}a.sort(function(a,b){return class_sort(a[0],b[0])});c=[];for(d=0;d<a.length;d++)c.push(a[d][1]);$("#modal-textarea").prop("rows",b.length);$("#modal-textarea").val(c.join("\r\n"));$("#modal").modal("show")}
function sortable_listener(){sortable(".sortable")[0].addEventListener("sortupdate",function(a){var b=cur_option,c=[];a.detail.newEndList.forEach(function(a){c.push(a.innerHTML.replace("*","").replace("+",""))});cur_classes=c;localStorage.setObj("spring21_cur_classes",cur_classes);select_slots();set_option(b)})}
function set_css(a){a?($(".fc-event .fc-bg").css("background","transparent"),$(".fc-content").css("color","white"),$(".fc-content").css("opacity","0.9")):($(".fc-event .fc-bg").css("background",""),$(".fc-content").css("color",""),$(".fc-content").css("opacity",""))}
function set_dark_mode(a){$("body, .modal-content").toggleClass("dark-mode-background",a);$(".modal-content").toggleClass("dark-mode-modal-lists",a);$(".fc-unthemed .fc-content, .fc-unthemed .fc-divider, .fc-unthemed .fc-list-heading td, .fc-unthemed .fc-list-view, .fc-unthemed .fc-popover, .fc-unthemed .fc-row, .fc-unthemed tbody, .fc-unthemed td, .fc-unthemed th, .fc-unthemed thead, hr").toggleClass("dark-mode-faint",a);$(".fc-axis, .fc-day-header, #buttons-div, #right-div, #eval-table_wrapper thead, .modal-body").toggleClass("dark-mode-light",
a);$(".dataTables_scrollBody").toggleClass("dark-mode-container",a);$("img[src^='img/cih'], img[src='img/iap.gif'], img[src='img/repeat.gif'], img[src='img/rest.gif']").toggleClass("dark-mode-invert",a);$("#buttons-div button, #semesters, input").toggleClass("dark-mode-background dark-mode-light dark-mode-faint",a);$("html").toggleClass("dark-mode-html",a)}
$(document).ready(function(){Cookies.set("school","MIT",{expires:3650});$("#calendar").fullCalendar({allDaySlot:!1,columnFormat:"dddd",defaultDate:"2016-08-01",defaultView:"agendaWeek",editable:!1,header:!1,height:"auto",minTime:"08:00:00",maxTime:"22:00:00",weekends:!1,eventClick:function(a,b,c){a=a.title.split(" ")[0];class_desc(a)}});table=$("#eval-table").DataTable({iDisplayLength:3E3,sDom:"t",deferRender:!0,order:[[0,"asc"]],columnDefs:[{targets:[0],type:"class",render:function(a,b,c,d){"display"===
b&&(a='<a href="#">'+a+"</a>");return a}},{targets:[1,2],searchable:!1},{targets:[3],orderable:!1}],scrollY:"275px",scroller:!0});fill_table();search_setup();$("#eval-loading").hide();$("#eval-table-div").show();table.columns.adjust().draw();$("#class-input").on("keypress",function(a){13==a.keyCode&&(a=$("#class-input").val().toUpperCase(),classes.hasOwnProperty(a)&&(-1==cur_classes.indexOf(a)?add_class(a):remove_class(a),$("#class-input").val("")))});$("#eval-table tbody").on("click","tr",function(){var a=
$(this).closest("tr");a=table.row(a);class_desc(a.data()[0])});$("#eval-table tbody").on("dblclick","tr",function(){var a=$(this).closest("tr");a=table.row(a).data()[0];-1==cur_classes.indexOf(a)?add_class(a):remove_class(a)});$("#cal-left").click(function(){set_option((cur_option+options.length-1)%options.length);$("#cal-left").blur()});$("#cal-right").click(function(){set_option((cur_option+options.length+1)%options.length);$("#cal-right").blur()});$("#activity-button").click(function(){activity_times=
[];activity_times_raw=[];$("#activity-input").val("");$("#activity-hours-input").val("0");activity_timeslot_close();$("#activity-modal").modal("show")});$("#start-time").timepicker({forceRoundTime:!0,disableTouchKeyboard:!0,minTime:"08:00am",maxTime:"09:30pm"});$("#end-time").timepicker({forceRoundTime:!0,disableTouchKeyboard:!0,minTime:"08:30am",maxTime:"10:00pm"});$("#activity-modal-add-timeslot").click(function(){add_activity_time()});$("#add-activity-button").click(function(){add_activity()});
$("#activity-input").on("keypress",function(a){13==a.keyCode&&add_activity()});$(".selector-button").click(function(){window[this.id+"_active"]=!window[this.id+"_active"];fill_table()});$("#hass_a, #hass_h, #hass_s").click(function(){hass_active&&$("#hass").trigger("click")});$(function(){$('[data-toggle="tooltip"]').tooltip();$('[data-toggle="popover"]').popover()});$(".lazyload-img").each(function(){$(this).attr("src",$(this).attr("data-src"))});$("#expand-button").click(function(){$("#adv-buttons-div").is(":visible")?
($("#adv-buttons-div").hide(),$("#expand-button").text("+ More filters")):($("#adv-buttons-div").show(),$("#expand-button").text("- Fewer filters"))});$("#prereg-link").click(function(){var a=[],b;for(b in cur_classes)"14.01R"===cur_classes[b]?a.push("14.01"):"14.02R"===cur_classes[b]?a.push("14.02"):-1==classes[cur_classes[b]].s.indexOf("a")&&a.push(cur_classes[b]);window.open("https://student.mit.edu/cgi-bin/sfprwtrm.sh?"+a.join(","),"_blank")});$("#calendar-link").click(function(){gapi.load("client:auth2",
calendar_export)});$("#clipboard-link").click(function(){$("#clipboard-button").tooltip("hide");clipboard_export()});$("#clipboard-button").click(function(){$("#modal-textarea").select();document.execCommand("copy")&&($("#clipboard-button").tooltip("show"),setTimeout(function(){$("#clipboard-button").tooltip("hide")},1E3));$("#modal-textarea").prop("selected",!1)});$("#toggle-css").click(function(){new_css=!new_css;set_css(new_css);localStorage.setObj("new_css",new_css)});$("#toggle-dark-mode").click(function(){dark_mode=
!dark_mode;set_dark_mode(dark_mode);localStorage.setObj("dark_mode",dark_mode)});$("#clear-all").click(function(){if(confirm("Are you sure you want to clear everything for this semester?")){var a=cur_classes.slice(),b;for(b in a)remove_class(a[b])}});$("#js-img-sm").mouseenter(function(){$(this).stop().animate({opacity:.6,right:"48px"},300,function(){$("#js-img-lg").show().animate({opacity:.8},120);$(this).hide()})});$("#js-div").mouseleave(function(){$("#js-img-lg").hide().css("opacity",.6);$("#js-img-sm").stop().show();
$("#js-img-sm").animate({opacity:.1,right:"0px"},350)});$("#manual-button").click(function(){if($("#manual-div").is(":visible"))$("#manual-div").hide(),$("#manual-button").text("+ Manually set sections");else{var a=[cur_class,"l"];if(-1!=classes[cur_class].s.indexOf("l")){$("#spec-man-lec-div").html("");for(var b in classes[cur_class].lr)$("#spec-man-lec-div").append('<input type="radio" class="man-button" id="lec-'+b+'" name="lec" value="'+b+'"> '+classes[cur_class].lr[b]+"<br>"),function(){var c=
b,d=a;$("#lec-"+c).click(function(){locked_slots[d]=c;localStorage.setObj("spring21_locked_slots",locked_slots);select_slots()})}();$("#man-lec-div").show()}else $("#man-lec-div").hide();a in locked_slots?$("#lec-"+locked_slots[a]).prop("checked",!0):$("#lec-auto").prop("checked",!0);a=[cur_class,"r"];if(-1!=classes[cur_class].s.indexOf("r")){$("#spec-man-rec-div").html("");for(var c in classes[cur_class].rr)$("#spec-man-rec-div").append('<input type="radio" class="man-rec-button" id="rec-'+c+'" name="rec" value="'+
c+'"> '+classes[cur_class].rr[c]+"<br>"),function(){var b=c,d=a;$("#rec-"+b).click(function(){locked_slots[d]=b;localStorage.setObj("spring21_locked_slots",locked_slots);select_slots()})}();$("#man-rec-div").show()}else $("#man-rec-div").hide();a in locked_slots?$("#rec-"+locked_slots[a]).prop("checked",!0):$("#rec-auto").prop("checked",!0);a=[cur_class,"b"];if(-1!=classes[cur_class].s.indexOf("b")){$("#spec-man-lab-div").html("");for(var d in classes[cur_class].br)$("#spec-man-lab-div").append('<input type="radio" class="man-button" id="lab-'+
d+'" name="lab" value="'+d+'"> '+classes[cur_class].br[d]+"<br>"),function(){var b=d,c=a;$("#lab-"+b).click(function(){locked_slots[c]=b;localStorage.setObj("spring21_locked_slots",locked_slots);select_slots()})}();$("#man-lab-div").show()}else $("#man-lab-div").hide();a in locked_slots?$("#lab-"+locked_slots[a]).prop("checked",!0):$("#lab-auto").prop("checked",!0);$("#manual-div").show();$("#manual-button").text("- Hide manual selection pane")}});$("#lec-auto").click(function(){var a=[cur_class,
"l"];a in locked_slots&&delete locked_slots[a];localStorage.setObj("spring21_locked_slots",locked_slots);select_slots()});$("#lec-none").click(function(){locked_slots[[cur_class,"l"]]="none";localStorage.setObj("spring21_locked_slots",locked_slots);select_slots()});$("#rec-auto").click(function(){var a=[cur_class,"r"];a in locked_slots&&delete locked_slots[a];localStorage.setObj("spring21_locked_slots",locked_slots);select_slots()});$("#rec-none").click(function(){locked_slots[[cur_class,"r"]]="none";
localStorage.setObj("spring21_locked_slots",locked_slots);select_slots()});$("#lab-auto").click(function(){var a=[cur_class,"b"];a in locked_slots&&delete locked_slots[a];localStorage.setObj("spring21_locked_slots",locked_slots);select_slots()});$("#lab-none").click(function(){locked_slots[[cur_class,"b"]]="none";localStorage.setObj("spring21_locked_slots",locked_slots);select_slots()});var a=localStorage.getObj("spring21_cur_classes"),b=localStorage.getObj("spring21_activities");if(null!=b){for(var c in b)null!=
a&&-1!=a.indexOf(b[c].no)&&set_activity(b[c].no,b[c].at,b[c].atr,b[c].h);localStorage.setObj("spring21_activities",activities)}b=localStorage.getObj("spring21_locked_slots");if(null!=b){for(var d in b)b.hasOwnProperty(d)&&-1!=a.indexOf(d.split(",")[0])&&(locked_slots[d]=b[d]);localStorage.setObj("spring21_locked_slots",locked_slots)}d=parseInt(localStorage.getObj("spring21_cur_option"));if(null!=a){for(var e in a)a[e]in classes&&(function(){var b=a[e],c=id_sanitize(b);$("#selected-div").append('<button type="button" class="btn btn-primary" id='+
c+"-button>"+b+"</button>");$("#"+c+"-button").click(function(){class_desc(b)});$("#"+c+"-button").dblclick(function(){remove_class(b)})}(),cur_classes.push(a[e]));$("#units-div").show();select_slots();d<options.length&&set_option(d)}sortable(".sortable",{forcePlaceholderSize:!0,placeholder:'<button type="button" class="btn btn-primary">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</button>'});sortable_listener();localStorage.getObj("new_css")&&(new_css=localStorage.getObj("new_css",new_css),
set_css(new_css));localStorage.getObj("dark_mode")&&(dark_mode=localStorage.getObj("dark_mode",dark_mode),set_dark_mode(dark_mode))});
