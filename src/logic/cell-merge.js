class Merge{
  constructor(grid){
    this.range=[]
    this.ready=false
    this.menu={x:0,y:0}
    this.show=false
    this.grid=grid
    this.cancelHandler=null
  }
  checkRows() {
    this.range.sort((a, b) => {
      return (a[0] - b[0] === 0) ? a[1] - b[1] : a[0] - b[0]
    })
    let rows = {}
    for (let i = 0; i < this.range.length; i++) {
      let row = this.range[i][0], col = this.range[i][1]
      if (this.grid[row][col] !== 0) {
        this.range = []
        return {rowSpan:0,colSpan:0}
      }
      if (!rows[row]) rows[row] = []
      rows[row].push(col)
    }
    let startRow = this.range[0][0]
    for (let i = 0; i < Object.keys(rows).length; i++) {
      let row = i + startRow
      if (!rows[row] || rows[row].length !== rows[startRow].length) {
        this.range = []
        return{rowSpan:0,colSpan:0}
      }
      for (let c = 0; c < rows[row].length; c++) {
        if (rows[row][c] !== rows[startRow][c]) {
          this.range = []
          return {rowSpan:0,colSpan:0}
        }
      }
    }
    return {rowSpan:Object.keys(rows).length,colSpan:rows[startRow].length}
  }
  check(e) {
    this.ready = false
    document.removeEventListener("mouseup", this.check)
    this.cancelHandler = this.cancel.bind(this)
    document.addEventListener("click", this.cancelHandler)
    if (this.range.length < 2) {
      this.range = []
      return
    }
    let res=this.checkRows()
    if(res.rowSpan>1 || res.colSpan>1){
      this.show = true
      this.menu.x = e.clientX
      this.menu.y = e.clientY
    }
  }
  join(row,col) {
    if (this.ready) {
      if (!this.in(row, col)) {
        this.range.push([row, col])
      }
    }
  }
  in(row,col){
    for (let i=0;i<this.range.length;i++){
      let cell=this.range[i]
      if(cell[0]===row && cell[1]===col){
        return true
      }
    }
    return false
  }
  emptyRowIndex(){
    for (let i=0;i<this.grid.length;i++) {
      if (this.grid[i].count(-1) === this.grid[0].length) {
        return i
      }
    }
    return -1
  }
  emptyColumnIndex(){
    for (let i=0;i<this.grid[0].length;i++) {
      let exist=true
      for (let r=0;r<this.grid.length;r++){
        if(this.grid[r][i]!==-1){
          exist=false
          break
        }
      }
      if(exist)return i
    }
    return -1
  }
  merge(fn){
    this.show=false
    document.removeEventListener("click",this.cancelHandler)
    let res=this.checkRows()
    if(res.rowSpan>1 || res.colSpan>1) {
      let cells = this.range
      this.range = []
      if (cells.length < 2) {
        return
      }
      for (let i = 1; i < cells.length; i++) {
        let r = cells[i][0], c = cells[i][1];
        this.grid[r][c] = -1
      }
      let start = cells[0]
      this.grid[start[0]][start[1]] = res.rowSpan * 100 + res.colSpan
      let columns=this.grid[0].length
      let index=this.emptyRowIndex()
      while (index!==-1){
        this.grid.splice(index, 1)
        for (let i=index-1;i>=0;i--) {
          for (let j = 0; j < columns; j++) {
            if (this.grid[i][j] > 1) {
              let rowSpan = Math.floor(this.grid[i][j] / 100) - 1
              rowSpan = (rowSpan > 1 ? rowSpan : 0)
              let colSpan = (this.grid[i][j] % 100 > 1) ? this.grid[i][j] % 100 > 1 : 0
              this.grid[i][j] = rowSpan * 100 + colSpan
            }
          }
        }
        index=this.emptyRowIndex()
      }
      index=this.emptyColumnIndex()
      while (index!==-1){
        for (let r=0;r<this.grid.length;r++){
          let rowSpan = Math.floor(this.grid[r][index-1] / 100)>1?Math.floor(this.grid[r][index-1] / 100):0
          let colSpan = (this.grid[r][index-1] % 100)-1
          this.grid[r][index-1] = rowSpan * 100 + (colSpan>1?colSpan:0)
          this.grid[r].splice(index,1)
        }
        index=this.emptyColumnIndex()
      }
      if (fn){
        fn(cells)
      }
    }
  }
  cancel(e){
    if (e.clientX!==this.menu.x || e.clientY!==this.menu.y) {
      this.show = false
      this.range = []
      document.removeEventListener("click", this.cancelHandler)
    }
  }
  start(row,col){
    if (this.grid[row][col]!==0) {
      return
    }
    this.ready=true
    this.range.push([row,col])
    this.show=false
    document.addEventListener("mouseup",this.check)
  }
}
export default Merge
