# React RASA INTERFACE
## 啟動專案
下載專案
```
$ git clone https://github.com/naluwan/Rasa-Interface-React.git
```
安裝依賴
```
$ npm install
```
啟動
```
$ npm start
```
終端機提示
```
You can now view RASA-INTERFACE in the browser.

Local: http://localhost:3000

```
瀏覽網址
```
http://localhost:3000
```
## 分支說明
* master - 主線，開發完成，測試無誤後，會將分支合併回主線
* refactorUserStep - 一問一答、進階分層回答(2層)皆可新增劇本、送至Rasa訓練，但UI為舊版尚未更新
* UIUX - UIUX更新版本，一問一答可使用，進階分層回答尚未實裝

## 資料夾結構
* src
  * components - 所有的component
  * actions - 定義所有store中會用到的action type
  * containers
    * Authenticate - 登入後才可看到此component包住的內容
    * ProtectedRoute - 沒有登入點擊此component包住的route時，會被導至登入頁
  * services/api - 定義api
  * store - 定義所有要執行的action
    * useStoryStore - 瀏覽故事頁的store
    * useCreateStoryStore - 新增故事頁的store
  * index.js - 網站的entry

