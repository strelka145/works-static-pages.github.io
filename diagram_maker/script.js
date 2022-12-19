//設定変更可能なパラメーター
var fontsize=16;
var padding=[10,5];
var lineThickness=1;
var margin=[20,20];


var texts = [];
var line_num=0;
var widthMax=0;
var heightMax=0;
var colorTemp;

function initialize(){
  fontsize=16;
  padding=[10,5];
  widthMax=0;
  heightMax=0;
  line_num=0;
  lineThickness=1;
  margin=[20,20]
}

function sortElementsByArray(base_elem,elemArray){
  for (const targetElemName of elemArray){
    var AllBaseElem = document.querySelectorAll("[name="+base_elem+"]");
    for (let i = 0; i < AllBaseElem.length; ++i) {
      var AllTargetElem = AllBaseElem[i].querySelectorAll("[name="+targetElemName+"]");
      for (let ii = 0; ii < AllTargetElem.length; ++ii) {
        AllBaseElem[i].appendChild(AllTargetElem[ii]);
      }
    }

  }
}

function getChartStyle(codeLine){
  if(codeLine.match(/(?<=#fontsize\s*=\s*)(\d+)/g)){
    fontsize=codeLine.match(/(?<=#fontsize\s*=\s*)(\d+)/g)[0];
  }else if(codeLine.match(/(?<=#padding_x\s*=\s*)(\d+)/g)){
    padding[0]=Number(codeLine.match(/(?<=#padding_x\s*=\s*)(\d+)/g)[0]);
  }else if(codeLine.match(/(?<=#padding_y\s*=\s*)(\d+)/g)){
    padding[1]=Number(codeLine.match(/(?<=#padding_y\s*=\s*)(\d+)/g)[0]);
  }else if(codeLine.match(/(?<=#linethick\s*=\s*)(\d+)/g)){
    lineThickness=Number(codeLine.match(/(?<=#linethick\s*=\s*)(\d+)/g)[0]);
  }else if(codeLine.match(/(?<=#margin_x\s*=\s*)(\d+)/g)){
    margin[0]=Number(codeLine.match(/(?<=#margin_x\s*=\s*)(\d+)/g)[0]);
  }else if(codeLine.match(/(?<=#margin_y\s*=\s*)(\d+)/g)){
    margin[1]=Number(codeLine.match(/(?<=#margin_y\s*=\s*)(\d+)/g)[0]);
  }
}

function getTextOptions(textBlock) {
  var options={};
  options.text=textBlock.substr(1, textBlock.length - 2);
  options.write=options.text.match(/^(\s*[^\$\s&]+)+/g)[0].match(/(?<=\s*)\S.*/g)[0];
  options.s_padding=options.text.match(/^\s*/g)[0].length;
  if(options.text.match(/[$][\w,#]+/g)){
    options.bgColor=options.text.match(/[$][\w,#]+/g)[0].substr(1, textBlock.length - 1);
  }else{
    options.bgColor='white';
  }
  return options;
}

function drawFigure() {
  var svg_elem=d3.select('svg')
    .append('g')
    .attr('name', 'all');
  var textsSelection = svg_elem
    .selectAll('text')
    .data(texts)
    .enter()
    .append('g')
    .attr('name', 'block');
  var text = textsSelection.append('text')
    .text(function(d) {
      return d.text;
    })
    .attr("font-family","Arial")
    .attr('font-size', fontsize)
    .each(function(d) {
      var bbox = this.getBBox();
      d.width = bbox.width;
      d.height = bbox.height;
      d.x = bbox.x;
      d.y = bbox.y;
    })
    .attr('name', 'text')
    .attr('dx',function(d){
      return padding[0]+(d.s_padding*10/2);
    })
    .attr('dy', function(d) {
        return -d.y+padding[1];
    });
  var rect = textsSelection.append('rect')
    .attr({
      width: function(d) {
        return d.width+(padding[0]*2)+(d.s_padding*10);
      },
      height: function(d) {
        return d.height+(padding[1]*2);
      },
      fill: function(d) {
        return d.bgColor;
      },
      stroke: 'black',
      rx: '5',
      ry: '5',
      name:'stroke'
    });

  var translate_x = 0;
  var next_start = 0;
  textsSelection.attr('transform', function(d, i) {
    translate_x = next_start;
    d.box_x=translate_x;
    next_start = translate_x + d.width + (d.space*10)+(padding[0]*2)+d.s_padding*10;
    d.box_xNext=next_start;
    return 'translate(' + (translate_x+margin[0]) + ','+(heightMax+margin[1])+')';
  });
  var line=svg_elem.append('line')
      .attr({
        x1:margin[0]+texts[0].box_x+(texts[0].width/2)+padding[0],
        y1:heightMax+margin[1]+(texts[0].height/2)+padding[1],
        x2:margin[0]+texts[texts.length-1].box_x+(texts[texts.length-1].width/2)+padding[0],
        y2:heightMax+margin[1]+(texts[0].height/2)+padding[1],
        stroke:"black",
        name:'line'
      })
      .attr("stroke-width",lineThickness);
  if((2*margin[0])+texts[texts.length-1].box_x+texts[texts.length-1].width+(2*padding[0])+(texts[texts.length-1].s_padding*10)>widthMax){
    widthMax=(2*margin[0])+texts[texts.length-1].box_x+texts[texts.length-1].width+(2*padding[0])+(texts[texts.length-1].s_padding*10);
  }
  heightMax=heightMax+(texts[0].height+(margin[1]*2)+(padding[1]*2));
  d3.select('svg')
  .attr("width",widthMax)
  .attr("height",heightMax)
  sortElementsByArray("block",["stroke","text"]);
  sortElementsByArray("all",["line","block"]);
}



let textarea = document.querySelector(`textarea`);

textarea.addEventListener('keyup', () => {
  initialize();
  document.querySelector(`#svg`).innerHTML = "";
  var codeLines=textarea.value.replace(/\r\n|\r/g, "\n").split( '\n' );
  for(const lineOfCode of codeLines){
    texts = [];
    var textBlocks = lineOfCode.match(/\[([^\]]+)\]/g);
    var spacerList = lineOfCode.match(/\](-*)/g);
    if (textBlocks !== null){
      for (let i = 0; i < textBlocks.length; ++i){
        var options=getTextOptions(textBlocks[i]);
        texts.push({
          text: options.write,
          bgColor:options.bgColor,
          space:spacerList[i].length - 1,
          s_padding:options.s_padding
        });
      }
      drawFigure();
      line_num++;
    }else{
      getChartStyle(lineOfCode);
    }

  }
});

var paletteInput = document.getElementById("color-palette");
var paletteElem = document.getElementById("palette");
paletteInput.addEventListener("click",() => {
 navigator.clipboard.writeText(paletteElem.value)
});


var download = document.getElementById("download-link");
download.addEventListener("click",() => {
  var svg = document.querySelector("svg");
  var svgData = new XMLSerializer().serializeToString(svg);
  var canvas = document.createElement("canvas");
  canvas.width = svg.width.baseVal.value;
  canvas.height = svg.height.baseVal.value;
  var ctx = canvas.getContext("2d");
  var image = new Image;
image.onload = function(){
    ctx.drawImage( image, 0, 0 );
    var a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.setAttribute("download", "image.png");
    a.dispatchEvent(new MouseEvent("click"));
}
image.src = "data:image/svg+xml;charset=utf-8;base64," + btoa(unescape(encodeURIComponent(svgData)));
})

window.addEventListener('load', function(){
  let e =new Event('keyup');
  let target = document.querySelector(`textarea`);
  target.dispatchEvent(e);
});
