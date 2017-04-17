/**
 * Created by Adib Abud Jaso (http://adib.awardspace.com) on 23/08/14.
 */

var oDragTargets = [];//Posiciones de los destinos ("DropTarget")
var oDragTarget;
var oDragItem;
var iClickOffsetX;
var iClickOffsetY;

var buenas;
var contestadas;
var total;
var MAX_INTENTOS = 2;
var DEJAR_SOLO = 8;

var bodyOriginal;

function OnLoad(){
    bodyOriginal = document.body.innerHTML;
    total = document.getElementsByClassName("DropTarget").length;
    iniciar();
}
window.onload = function(){
    //console.log("cargó la página");
    OnLoad();
    bodyOriginal = document.body.innerHTML;
    window.onresize = function(){
        //console.log("cambió tamaño");
        ajustarDestinos();
    };
};
function iniciar(){
    oDragTarget = null;
    oDragItem = null;
    iClickOffsetX = 0;
    iClickOffsetY = 0;

    buenas = 0;
    contestadas = 0;
    revolver();
    reducir();
    SetupDragDrop();
}
function reiniciar(){
    document.body.innerHTML = bodyOriginal;
    iniciar();
}
function revolver(){
    var opciones = Array.from(document.getElementById("Preguntas").querySelectorAll(".DropTarget"));
    shuffle(opciones).forEach(function(elemento) {
        elemento.parentNode.insertBefore(elemento, elemento.parentNode.firstChild);//se vuelven a agregar para revolver
    });
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
}
function reducir(){
    var list = document.getElementById("Preguntas");
    while(list.children.length > DEJAR_SOLO+1){
        list.removeChild(list.childNodes[0]);
    }

}
function SetupDragDrop(){
    ajustarDestinos();
    var botones = document.getElementsByClassName("Dragable");
    for(var i = 0; i<botones.length; i++){
        MakeDragable(botones[i]);
        botones[i].padreOriginal = botones[i].parentNode;
        //botones[i].intentos = 0;
        //console.log(i+" - "+botones[i].parentNode + " - " + botones[i].padreOriginal);
    }
    Array.prototype.forEach.call(document.getElementsByClassName("DropTarget"), function(elemento){
        elemento.intentos = 0;
    })

}
function ajustarDestinos(){
    oDragTargets = [];
    var destinos = document.getElementsByClassName("DropTarget");
    for(var i = 0; i<destinos.length; i++){
        oDragTargets.push(GetObjPos(destinos[i]));
    }
}

function MakeDragable(oBox){
    //if (navigator.platform=="iPad" || navigator.platform =="iPhone"){
    if (is_touch_device()){
        oBox.ontouchstart= function(e){TouchStart(e)};
        oBox.ontouchmove=function(e){TouchMove(e)};
        oBox.ontouchend=function(e){TouchEnd(e)};
    }else{
        oBox.onmousemove= function(e){DragMove(oBox,e)};
        oBox.onmouseup=function(e){DragStop(oBox,e)};
        oBox.onmousedown=function(e){DragStart(oBox,e);return false};
    }
}
//Extra para deshabilitar
function UnmakeDragable(oBox){
    if (is_touch_device()){
        oBox.ontouchstart = null;
        oBox.ontouchmove = null;
        oBox.ontouchend = null;
    }else{
        oBox.onmousemove = null;
        oBox.onmouseup = null;
        oBox.onmousedown = null;
    }
    oBox.style.cursor = "auto";
}

function is_touch_device() {
    return 'ontouchstart' in window; // works on most browsers
    //|| 'onmsgesturechange' in window; // funciona en ie10, no en 11
}


function TouchStart(e){
    var oPos = GetObjPos(e.target);
    iClickOffsetX = e.targetTouches[0].pageX - oPos.x;
    iClickOffsetY = e.targetTouches[0].pageY - oPos.y;
    ajustarDestinos();
}

function DragStart(o,e){
    if(!e) var e = window.event;
    oDragItem = o;

    if (e.offsetX){
        iClickOffsetX = e.offsetX;
        iClickOffsetY = e.offsetY;
    }else{
        var oPos = GetObjPos(o);
        iClickOffsetX = e.clientX - oPos.x;
        iClickOffsetY = e.clientY - oPos.y;
    }

    if (o.setCapture){
        o.setCapture();
    }else{
        window.addEventListener ("mousemove", DragMove2, true);
        window.addEventListener ("mouseup",   DragStop2, true);
    }
    ajustarDestinos();
}

function DragMove2(e){
    DragMove(oDragItem,e);
}

function DragStop2(e){
    DragStop(oDragItem,e);
}

function DragMove(o,e){
    if (oDragItem==null) return;

    if(!e) var e = window.event;
    var x = e.clientX + window.pageXOffset - document.body.clientLeft - iClickOffsetX;
    var y = e.clientY + window.pageYOffset - document.body.clientTop - iClickOffsetY;
    //console.log(o.offsetWidth, o.offsetHeight);
    HandleDragMove(x,y, e.clientX - o.offsetWidth, e.clientY - o.offsetHeight);
}

function HandleDragMove(x,y, botonX, botonY){
    oDragItem.style.zIndex = 1000;
    /*oDragItem.style.position="absolute";*/
    oDragItem.style.position="fixed";
    oDragItem.style.left=botonX+"px";
    oDragItem.style.top=botonY+"px";


    for (var i=0; i< oDragTargets.length; i++){
        var oTarget = oDragTargets[i];
        if (oTarget.x < x && oTarget.y < y && (oTarget.x + oTarget.w) > x && (oTarget.y + oTarget.h) > y){
            if (oDragTarget!=null && oDragTarget != oTarget.o) OnTargetOut();
            oDragTarget = oTarget.o;
            OnTargetOver();
            return;
        }
    }

    if (oDragTarget){
        OnTargetOut();
        oDragTarget = null;
    }
}

function TouchMove(e){
    e.preventDefault();
    var x = e.targetTouches[0].pageX + window.pageXOffset - document.body.clientLeft - iClickOffsetX;
    var y = e.targetTouches[0].pageY + window.pageYOffset - document.body.clientTop - iClickOffsetY;
    oDragItem = e.currentTarget;
    //HandleDragMove(x,y);
    //mensajear("x: "+e.targetTouches[0].clientX+", y: "+e.targetTouches[0].clientY);
    //console.log("e.targetTouches[0]: ", e.targetTouches[0]);
    HandleDragMove(x,y, e.targetTouches[0].clientX - oDragItem.offsetWidth, e.targetTouches[0].clientY - oDragItem.offsetHeight);
}

function DragStop(o,e){
    if (o.releaseCapture){
        o.releaseCapture();
    }else if (oDragItem){
        window.removeEventListener ("mousemove", DragMove2, true);
        window.removeEventListener ("mouseup",   DragStop2, true);
    }

    HandleDragStop();
}

function HandleDragStop(){
    //console.log("oDragTargets: ", oDragTargets);
    if (oDragItem==null) {
        return;
    }
    if (oDragTarget){
        //console.log(oDragItem, oDragTarget);
        if(oDragItem.getAttribute("data-tipo") == oDragTarget.getAttribute("data-destino")){
            oDragTarget.className = "DropTargetResuelto bien";
            oDragTarget.innerHTML += "<br />" + oDragItem.innerHTML;
            OnTargetOut();
            OnTargetDrop();
            oDragTarget = null;
            contestadas++;
            buenas++;

            revisar();
        } else {
            oDragTarget.intentos++;
            if(oDragTarget.intentos >= MAX_INTENTOS){
                oDragTarget.className = "DropTargetResuelto mal";
                oDragTarget.innerHTML += "<br />" + oDragItem.innerHTML;
                contestadas++;
                revisar();
            }
        }
    }

    //Siempre regresa DragItem
    //oDragItem.padreOriginal.appendChild(oDragItem);
    oDragItem.style.position="";

    oDragItem.style.zIndex = 1;
    oDragItem = null;
}
function revisar(){
    var total = DEJAR_SOLO;
    if(contestadas == total){
        var mensaje = "";
        if(buenas == total){
            mensaje = "¡Muy bien!";
        } else {
            mensaje = "Inténtalo de nuevo.";
        }
        var calificacion = (buenas/total)*10;
        //mensajear('Terminótodo');
        retroalimentar(mensaje+" Calificación: <b>"+calificacion+'</b>. Obtuviste <b>'+ buenas + "</b> de <b>" + total +'</b>.<br /><input id="botonReiniciar" type="button" value="Otra vez" onClick="reiniciar()">');
        document.getElementById('botonReiniciar').scrollIntoView();
    }
}

function TouchEnd(e){
    //e.target.innerHTML = "TouchEnd";
    HandleDragStop();
}

function $(s){
    return document.getElementById(s);
}

function GetObjPos(obj){
    var x = 0;
    var y = 0;
    var o = obj;

    var w = obj.offsetWidth;
    var h = obj.offsetHeight;
    if (obj.offsetParent) {
        x = obj.offsetLeft;
        y = obj.offsetTop;
        while (obj = obj.offsetParent){
            x += obj.offsetLeft;
            y += obj.offsetTop;
        }
    }
    return {x:x, y:y, w:w, h:h, o:o};
}

//Drag and Drop Events
function OnTargetOver(){
    oDragTarget.style.border = "2px solid #4673d7";
}

function OnTargetOut(){
    oDragTarget.style.border = "";
}

function OnTargetDrop(){
    oDragItem.style.position="";
    //oDragTarget.appendChild(oDragItem);
    //if (navigator.platform=="iPad") MakeDragable(oDragItem);
    if (is_touch_device()) MakeDragable(oDragItem);
}

function mensajear(cadena){
    //document.getElementById("mensajes").innerHTML = cadena;
}
function retroalimentar(texto){
    document.getElementById("retroalimentacion").innerHTML = texto;
}