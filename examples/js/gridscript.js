var dataPage = 'woFilterAllCopy';
//var siteURL='/Kund/Bridge/workorder.nsf' + '/' + dataPage;
var siteURL='/Kund/Bridge/workorder.nsf' + '/' + dataPage;
var dataView;
var grid;
var data = [];
var i = 0;
var row = -1;
var columns = [];
var ajax = 0;
var options = {
    enableCellNavigation: true,
      asyncEditorLoading: false,
    showHeaderRow: true,
    headerRowHeight: 30,

    explicitInitialization: true

  };
var searchString = "";
var sortcol = "title";
var sortdir = 1;
var percentCompleteThreshold = 0;
var searchString = "";
var queued  = [];
var loopcount = 0;
var dataType = {};
if( window.Worker)
var primeWorker = new Worker('js/worker.js');

var columnFilters = {};

function percentCompleteSort(a, b) {
  return a["percentComplete"] - b["percentComplete"];
}

function comparer(a, b) {
  var x = a[sortcol], y = b[sortcol];
  return (x == y ? 0 : (x > y ? 1 : -1));
}
//=============================================

function JSDateToExcelDate(inDate) {

var returnDateTime = 25569.0 + ((inDate.getTime() - (inDate.getTimezoneOffset() * 60 * 1000)) / (1000 * 60 * 60 * 24));
return returnDateTime.toString().substr(0,20);

}


require.config({
                text: 'text.js',
                paths: {
                    JSZip: '//cdnjs.cloudflare.com/ajax/libs/jszip/2.0.0/jszip'
                },
                shim: {
                    'JSZip': {
                        exports: 'JSZip'
                    }
                }
            });

function detectdata(key,data){
  console.log(key);
  // console.log(data);


  switch(key) {
    case '$51':
          
          if(Date.parse(data)){
            var date = Number(JSDateToExcelDate(new Date(data)));
            return {value:date, metadata: {style: dateformat.id}}
          }else{
            return ""
          }
        break;
    case '$28':
          var out = data.match(/^\[(.*)\]/i);
          if(out!=null){
             return $(out['1']).html();
          } 
    // break;
    // case '$52':
    //       return "" ;
    // break;
   
    default:
    return data;
       // default code block
  }


}

function getExceldata() {
          selectedIndexes = grid.getSelectedRows();
          var selectedData =[];
          var count = 0;
          if(selectedIndexes.length>0){
            return [selectedIndexes,'checked'];

          for(index in selectedIndexes){
              formatedarray = [];
              for(key in dataView.getItem(index)){
                for(columnkey in columns){
                        if(columns[columnkey]['field']==key){
                            formatedarray.push(data[index][key]);
                        }
                      }
              }
             selectedData[count]  = formatedarray;
              count++;
          }
        }else{
          for(var allrowcount=0;allrowcount<dataView.getLength();allrowcount++){
              formatedarray = [];
              
              for(key in dataView.getItem(allrowcount)){
                  if(key!=='unid' && key!=='id'){
                   var formateddata = detectdata(key,data[allrowcount][key]);    
                     
                     formatedarray.push(formateddata);
                  }
                   }
             selectedData.push(formatedarray);
          }
        }
      return selectedData;
      }
function createdata(){

  require(['excel-builder', 'text!testdata.json','gridfeeder', 'BasicReport','download'], function (EB, testdata,gridfeeder,BasicReport,downloader) {
      var basicReport = new BasicReport();
      var artistWorkbook = EB.createWorkbook();
      var albumList = artistWorkbook.createWorksheet({name: 'Album List'});
      var  columns         = [];
       dateformat = artistWorkbook.getStyleSheet().createFormat({
          format: 'mm-dd-yy hh:mm:ss AM/PM'
      });


      var gridcolumns      = gridfeeder.getColumns();
       var tmporiginalData = [];
       columnnames = [];
      for(index in gridcolumns){
          if(gridcolumns[index]['id']!=="_checkbox_selector"){
             columnnames.push(gridcolumns[index]['name']);
          }
       }
     
      tmporiginalData.push(columnnames); 
      var exceldata = getExceldata();
     

        
      for(index in  exceldata ){
        tmporiginalData.push(exceldata[index]);
        
      }
      
      var originalData = [];
     // originalData.push(tmporiginalData);
      albumList.setData(tmporiginalData);
      artistWorkbook.addWorksheet(albumList);
 
      var data = EB.createFile(artistWorkbook);
      downloader('Artist WB.xlsx', data);
    });
}
//===============================================


function getcolumn(){
  return $.ajax({
  type: "GET",
  //url: siteURL + "?readdesign&outputformat=json",
  url:'latestviewcolums.json',
  dataType:'json'
    });
}

function filter(item,args) {
for (var columnId in columnFilters) {
      if (columnId !== undefined && columnFilters[columnId] !== "") {
        var c = grid.getColumns()[grid.getColumnIndex(columnId)];
        if (item[c.field].toLowerCase().indexOf(columnFilters[columnId].toLowerCase()) == -1) {
          return false;
        }
      }
    }
    return true;
  }

function printexcel() {
  selectedIndexes = grid.getSelectedRows();
  var selectedData =[];
  var count = 0;
  if(selectedIndexes.length>0){
  for(index in selectedIndexes){
      formatedarray = {};
      for(key in dataView.getItem(index)){
        for(columnkey in columns){
                if(columns[columnkey]['field']==key){
                    formatedarray[columns[columnkey]['name'].replace(/[^a-zA-Z]/g, "")] = data[index][key];
                }
              }
      }
     selectedData[count]  = formatedarray;
      count++;
  }
}else{
  for(var allrowcount=0;allrowcount<dataView.getLength();allrowcount++){
      formatedarray = {};
      for(key in dataView.getItem(allrowcount)){
          for(columnkey in columns){
                if(columns[columnkey]['field']==key){
                    formatedarray[columns[columnkey]['name'].replace(/[^a-zA-Z]/g, "")] = data[allrowcount][key];
                }
           }
      }
     selectedData[count]  = formatedarray;
      count++;
  }
}
  makeexecl(selectedData);
}

function openmap() {
  
  selectedIndexes = grid.getSelectedRows();

  if(selectedIndexes.length>0){

  if(selectedIndexes.length==1){
      maparray          = {};
      maparray['docid'] =  dataView.getItem(0)['unid'];
    openGoogleMap(maparray);
    }else{
        maparray        = {};
        maparray['docids']          = [];
        for(index in selectedIndexes){
          maparray['docids'][index] = dataView.getItem(index)['unid'];
        }
        openGoogleMap(maparray);
    }
 }else{
    if(dataView.getLength()==1){
        maparray          = {};
        maparray['docid'] =  dataView.getItem(0)['unid'];
        openGoogleMap(maparray);
    }else{
        maparray        = {};
        maparray['docids']          = [];
        for(var allrowcount=0;allrowcount<dataView.getLength();allrowcount++){
          maparray['docids'][allrowcount] = dataView.getItem(allrowcount)['unid'];
        }
        
        openGoogleMap(maparray);

    }


 }

}


function ordercolumns(unsortedcolumn){
  var items = [];
  var cols = unsortedcolumn['column'];
  $.each( cols,function(index,col){  
          columns.push(
                        {
                            id: col['@columnnumber'], 
                            name:col['@title'], 
                            field: col['@name'],
                            cssClass: "cell-selection", 
                            width: col['@width']*3,
                            cannotTriggerInsert: true, 
                            resizable: false,
                            selectable: true,
                            formatter: optionsFormatter ,
                            sortable: true
                       
                         }
            );
         });
    return columns;

}

function optionsFormatter(row, cell, value, columnDef, dataContext){
  if(value){
    
    var out = value.match(/^\[(.*)\]/i);
    if(out!=null){
      return out['1'];
    } 
    return value;
  }

}

function formatDate(date){
  datearray   = date.split(',');
  dateandtime = datearray[0].split('T');
  year        = dateandtime[0].substring(0, 4);
  month       = parseInt(dateandtime[0].substring(4, 6)) - 1; 
  day         = dateandtime[0].substring(6, 8); 
  hour        = dateandtime[1].substring(0, 2); 
  minute      = dateandtime[1].substring(2, 4); 
  sec         = dateandtime[1].substring(4, 6); 
  var date = new Date(Date.UTC(year, month,day, hour, minute, sec));
  return date.toLocaleString();
}

function getNewrows(startfrom, count){
if(typeof(Worker) !== "undefined") {
   primeWorker.postMessage([startfrom,count]);
   primeWorker.onmessage = function(element) {
      var here = element.data;
       if(here['viewentry']!=="undefined"){
              if(typeof queued[loopcount]!=='undefined'){
                  getNewrows(queued[loopcount][0],queued[loopcount][1]);
                  loopcount++;
                  arrageData(here['viewentry']);
                 }else{
                  grid.init();
                  dataView.beginUpdate();
                  dataView.setItems(data);
                  dataView.setFilter(filter);
                  dataView.endUpdate();
                 }
              }
    };
}else {
    ajax++;
    $.ajax({
      type: "GET",
    //  url: siteURL + "?readviewentries&outputformat=json",
    data : { start : startfrom, count : count },
      url: 'fulljson.json',
       dataType:'json',
       success:function(newdata){
              if(queued[loopcount]){
                getNewrows(queued[loopcount][0],queued[loopcount][1]);
                loopcount++;
                arrageData(newdata['viewentry']);
                grid.setData(data);
                grid.render();
                }
            }
    });
  }
}

function getgriddata(){
  return $.ajax({
    type: "GET",
   // url: siteURL + "?readviewentries&outputformat=json&count=3000",
    url: 'fulljson.json',
     dataType:'json'
  });
}



function arrageData(unfromated){
   $.each(unfromated,function(index,rows){
           data[i] = {};
           row++;
           data[i]['unid']    = rows['@unid'];
           $.each(rows['entrydata'],function(index,cindcolum){
                if("text" in cindcolum){
                    data[i]['id']               =  cindcolum['@columnnumber']+row+" "+i;
                    data[i][cindcolum['@name']] =  cindcolum['text']['0'];
                    keystatus = cindcolum['@name'] in dataType;
                    if(!keystatus){
                      dataType[cindcolum['@name']] ='text';
                    }
                  }
                 else if("textlist" in cindcolum){
                    data[i]['id']               =  cindcolum['@columnnumber']+row+" "+i;
                    data[i][cindcolum['@name']] =  cindcolum['textlist']['text'][0];
                    keystatus = cindcolum['@name'] in dataType;
                    if(!keystatus){
                      dataType[cindcolum['@name']] ='textlist';
                    }
                  }else if("number" in cindcolum){
                    data[i]['id']               =  cindcolum['@columnnumber']+row+" "+i;
                    data[i][cindcolum['@name']] =  cindcolum['number'][0];
                    keystatus = cindcolum['@name'] in dataType;
                    if(!keystatus){
                      dataType[cindcolum['@name']] ='number';
                    }
                  }else if("datetime" in cindcolum){
                    data[i]['id']               =  cindcolum['@columnnumber']+row+" "+i;
                    var readableDate            =  formatDate(cindcolum['datetime'][0]);
                    data[i][cindcolum['@name']] =  readableDate;
                    keystatus = cindcolum['@name'] in dataType;
                    if(!keystatus){
                      dataType[cindcolum['@name']] ='datetime';
                    }
                  }
              else{
                    alert('new format found!!! check console');
                    return false;
                 }
             });
            i++;
          
          
           });
 
//var unfromated = undefined;
}

 function updateFilter() {
    dataView.setFilterArgs({
      searchString: searchString
    });
    dataView.refresh();
  }


$(function () {


     var checkboxSelector = new Slick.CheckboxSelectColumn({
      cssClass: "slick-cell-checkboxsel"
    });

    columns.push(checkboxSelector.getColumnDefinition());

    columnajax = getcolumn();
    columnajax.done(function (allcolumns) {
    columns =  ordercolumns(allcolumns);
    datapromise = getgriddata();
    datapromise.done(function(newdata){
    var toplevelentries = newdata['@toplevelentries'];
    var percount        = newdata['viewentry'].length;
    totalrequest = Math.ceil(toplevelentries/percount); 
        
    //
   

    arrageData(newdata['viewentry']);

    dataView = new Slick.Data.DataView();
    grid = new Slick.Grid("#myGrid", dataView, columns, options);
    grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
    grid.registerPlugin(checkboxSelector);
     var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));
    
    grid.onSort.subscribe(function (e, args) {
    sortdir = args.sortAsc ? 1 : -1;
    sortcol = args.sortCol.field;

    if ($.browser.msie && $.browser.version <= 8) {
      // using temporary Object.prototype.toString override
      // more limited and does lexicographic sort only by default, but can be much faster

      var percentCompleteValueFn = function () {
        var val = this["percentComplete"];
        if (val < 10) {
          return "00" + val;
        } else if (val < 100) {
          return "0" + val;
        } else {
          return val;
        }
      };

      // use numeric sort of % and lexicographic for everything else
      dataView.fastSort((sortcol == "percentComplete") ? percentCompleteValueFn : sortcol, args.sortAsc);
    } else {
      // using native sort with comparer
      // preferred method but can be very slow in IE with huge datasets
      dataView.sort(comparer, args.sortAsc);
    }
  });


    grid.onHeaderRowCellRendered.subscribe(function(e, args) {
        $(args.node).empty();
        if(args.column.id=="_checkbox_selector"){
          return true;
        }
        if(args.column.name=="Icon"){
          return true;
        }
        $("<input type='text'>")
           .data("columnId", args.column.id)
           .val(columnFilters[args.column.id])
           .appendTo(args.node);
    });

  $("#txtSearch,#txtSearch2").keyup(function (e) {
    Slick.GlobalEditorLock.cancelCurrentEdit();

    // clear on Esc
    if (e.which == 27) {
      this.value = "";
    }
    searchString = this.value;
    updateFilter();
  });


    dataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
    var isLastPage = pagingInfo.pageNum == pagingInfo.totalPages - 1;
    var enableAddRow = isLastPage || pagingInfo.pageSize == 0;
    var options = grid.getOptions();

    if (options.enableAddRow != enableAddRow) {
      grid.setOptions({enableAddRow: enableAddRow});
    }
  });


    $(grid.getHeaderRow()).delegate(":input", "change keyup", function (e) {
      var columnId = $(this).data("columnId");
      if (columnId != null) {
        columnFilters[columnId] = $.trim($(this).val());
        dataView.refresh();
      }
    });      

     // move the filter panel defined in a hidden div into grid top panel
  $("#inlineFilterPanel")
      .appendTo(grid.getTopPanel())
      .show();

    dataView.onRowCountChanged.subscribe(function (e, args) {
        grid.updateRowCount();
         grid.invalidateRows(args.rows);
        grid.render();
      });
    dataView.onRowsChanged.subscribe(function (e, args) {
        grid.invalidateRows(args.rows);
        grid.render();
      });
  
    //===========get other set of data's===================
    totalrequest = 3;
     for(k=1;k<totalrequest;k++){ 
       if(k==1)
       var apirequest = getNewrows((k * percount) + 1, percount);
        else{
            start = (k * percount) + 1;
            queued.push([start,percount]);
        }
      }
   //    ============================== 
       
      grid.init();
      dataView.beginUpdate();
      dataView.setItems(data);
      dataView.setFilter(filter);
      dataView.endUpdate();

    })
  })

})