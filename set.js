class MySet{
    constructor(iterator = []) {
        //验证是否是可迭代的对象
        if (typeof iterator[Symbol.iterator] !== "function") {
            throw new TypeError(`你提供的${iterator}不是一个可迭代的对象`)
        }
        //到这里验证已经通过了，我们需要将每一次迭代的数据保存到set集合里面，
        //这里我们采用数组保存，set集合里面提供了一个add方法，我们可以利用这个方法来添加
        this._datas = [];
        for (const item of iterator) {
            //利用add方法添加数据
        }
    }
    //实现add方法添加数据的时候，还需要验证数据是否存在，利用set集合提供的has函数来实现数据验证
    add(data) {
        if (!this.has(data)) {
            this._datas.push(data);
        }
    }
    //在这里判断的时候再利用一个辅助函数来帮助我们验证
    has(data) {
        for (const item of this._datas) {
            if (this.isEqual(data, item)) {
                return true;
            }
        }
        return false;
    }
    /**
     * 判断两个数据是否相等
     * @param {*} data1 
     * @param {*} data2 
     */
    isEqual(data1, data2) {
        if (data1 === 0 && data2 === 0) {
            return true;
        }
        return Object.is(data1, data2);
    }
    //这里直接操作的数组，比较方便实现，当然只是类比实现set集合
    delete(data) {
        for (let i = 0; i < this._datas.length; i++) {
            const element = this._datas[i];
            if (this.isEqual(element, data)) {
                //删除
                this._datas.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    //这个方法比较简单，将set集合置为空，即数组为空
    clear() {
        this._datas.length = 0;
    }
    //这个属性比较特殊，只读属性，这里采用es6的新增的关键字就可以轻松实现
    get size() {
        return this._datas.length;
    }
    //这里如果不太熟悉的化可以看一下我写的生成器迭代器的文章
    *[Symbol.iterator]() {
        for (const item of this._datas) {
            yield item;
        }
    }
    //这里的forEach和数组的forEach差不多，唯一不同的是这里的forEach第二项和第一项一样不是下标，而数组的第二项是下标
    forEach(callback) {
        for (const item of this._datas) {
            callback(item, item, this);
        }
    }
}