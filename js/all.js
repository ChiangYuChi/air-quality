//DOM
var loading = document.querySelector('.loading')
var select = document.getElementById('location');
var placeTitle = document.querySelector('.location');
var degree = document.querySelector('.degree');
var time = document.querySelector('.time');
var detail = document.querySelectorAll('.detail .number');
var detailTitle = document.querySelector('.detailTitle');

var infoList = document.querySelector('.infoList');


//event listener


//點選選單後之後更新全部
select.addEventListener('change', function (e) {
    e.preventDefault();
    updateAll(e.target.value);
});
//點選右邊項目會把細節呈現在左邊

infoList.addEventListener('click', function (e) {
    e.preventDefault();
    if (e.target.nodeName == 'A') {
        updateDetail(e.target.textContent);
    } else {
        return
    };
});




//catch data
var url = 'https://script.google.com/macros/s/AKfycbysO5ektpVfu6f1dqVygmD8l8QGaOthc5GFPWsv17YM4YP3hGw/exec?url=http://opendata.epa.gov.tw/webapi/Data/REWIQA/?format=json';
fetch(url, {})
    .then((response) => {
        return response.json();
    }).then((data) => {
        getData(data); //save data
        updateAll('新北市'); //更新所有頁面 ( datail, infoList) 
    }).then(() => {
        loading.style.display = 'none'; //待資料渲染至頁面後，關閉 loading page
    }).catch((err) => {
        console.log(err);
    });

//儲存色彩資訊

var colors = [{
        status: '良好',
        color: '#95F084'
    }, {
        status: '普通',
        color: '#FFE695'
    },
    {
        status: '對敏感族群不健康',
        color: '#FFAF6A'
    },
    {
        status: '對所有族群不健康',
        color: '#FF5757'
    },
    {
        status: '非常不健康',
        color: '#9777FF'
    },
    {
        status: '危害',
        color: '#AD1774'
    }
]

//套用degree顏色

for (let i = 0; i < degree.children.length; i++) {
    degree.children[i].style.backgroundColor = colors[i].color;
}

//儲存資料，並將地點存入新陣列中
var datalist;

function getData(data) {
    datalist = data;
    let location = new Set();
    for (let i = 0; i < datalist.length; i++) {
        location.add(datalist[i].County);
    };
    addInSelect(location);
}

//將地點加入選單中

function addInSelect(location) {
    location.forEach(element => {
        let option = document.createElement('option');
        option.setAttribute('value', element);
        option.innerHTML = element;
        select.appendChild(option);
    });
};

// 更新細節
function updateDetail(place) {

    datalist.find((item) => {
        //如果在d
        if (item.SiteName == place) {
            //將各項空污指標存入陣列中
            let data = []
            data.push(item.O3, item.PM10, item['PM2.5'], item.CO, item.SO2, item.NO2);
            //更新 detailTitle
            detailTitle.children[0].innerHTML = place; //更新地點
            detailTitle.children[1].innerHTML = item.AQI; //更新分數

            //上色
            let colorList = colors.find((el) => {
                if (el.status == item.Status) {
                    return el;
                }
            });
            detailTitle.children[1].style.backgroundColor = colorList.color;
            //將 data內的資料更新至 detail上
            for (let i = 0; i < data.length; i++) {
                if (data[i] == '') {
                    data[i] = 'N/A'
                };
                detail[i].innerHTML = data[i];
            }
            return;
        }
    });
}


//更新所有


//更新所有資訊

function updateAll(location) {
    //更新標題
    placeTitle.innerHTML = location;
    //更新時間
    time.innerHTML = datalist[0].PublishTime + ' 更新';
    //清空 infoList
    infoList.innerHTML = '';
    //更新 infoList

    //我們想要呈現在銀幕上的資料，在datalist裡一個一個過去
    let data = datalist.filter((item) => {
        //如果過濾出來的，是我們點選的，就回傳
        if (item.County == location) {
            return item;
        }
    });
    //以 AQI 由大到小排序 

    //這裡的data 是上面過濾過的data 
    let sortedData = data.sort((a, b) => {
        let x = a.AQI;
        let y = b.AQI;
        return y - x;
    })


    //排序過的資料，要組字串放入畫面
    //傳入並在給定的函式當做參數，都執行一次
    sortedData.forEach((el) => {

        //宣告一個新變數，是新的li 節點
        let newList = document.createElement('li');
        //如果傳入的參數的 AQI 是空值或hypen，就替代為N/A
        if (el.AQI == '' | el.AQI == '-') {
            el.AQI = 'N/A'
        };
        //上色，在上面的顏色陣列裡尋找，如果顏色的狀態跟傳入的el狀態一樣，回傳顏色
        let colorList = colors.find((col) => {
            if (col.status == el.Status) {
                return col;
            };
        });
        //若資料內沒有 status (設備維修) 則套用此顏色
        if (colorList == undefined) {
            colorList = {
                color: '#EEEEEE'
            };
        }
        //組字串並更新
        let str = `<div class="infoBox">
                       <a href='#' class="place infoBox">${el.SiteName}</a>
                       <div class="AQI infoBox" style="background-color:${colorList.color}">${el.AQI}</div>
                   </div>`;
        newList.innerHTML = str;

        infoList.appendChild(newList);

    });
    //並且更新細項，把排序第一個
    updateDetail(sortedData[0].SiteName);

}