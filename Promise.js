const PENDING = "pending";
const RESLOVED = "resloved";
const REJECTED = "rejected";
const thenables = Symbol("thenables");
const catchables = Symbol("catchables");
class MyPromise{
    constructor(handle) {
        this.PromiseState = PENDING;
        this.PromiseResult = undefined;
        this[thenables] = [];
        this[catchables] = []
        const changeState = (state, result, arr) => {
            if(this.PromiseState === PENDING){
                this.PromiseState = state;
                this.PromiseResult = result;
                arr.length !== 0 ? arr.forEach(item => item(this.PromiseResult)) : ""
            }
            
        }
        const reslove = data => {
            changeState(RESLOVED, data, this[thenables])
        }
        const reject = err => {
            changeState(REJECTED, err, this[catchables]);
        }
        try {
            handle(reslove, reject);
        } catch (error) {
            throw new Error("Promise resolver undefined is not a function")
        }
        
    }

    throw() {
        throw new Error("err"); 
    }

    settledHandler(handle, queue, state){
        if(typeof handle !== "function"){
            return
        }
        
        if(state === this.PromiseState){
            setTimeout(() => {
                handle(this.PromiseResult)
            }, 0);
            
        }else{
            queue.push(handle);
        }
        
    }
    /**
     * 
     * @param {*} thenable reslove状态的处理函数
     * @param {*} catchable reject状态的处理函数
     * @returns 
     */
    linkPromise(thenable, catchable) {
        function exec(data, handle, reslove, reject) {
            try {
                const res = handle(data);
                /**
                 * 这里的一个特殊情况就是处理函数返回的是Promise对象，我们需要进行特殊处理
                 */
                if(res instanceof MyPromise){
                    res.then(d => {
                        reslove(d)
                    }, e => {
                        reject(e)
                    })
                }else{
                    reslove(res)
                }
            } catch (error) {
                reject(error)
            }
        }
        /**
         * 由于返回的Promise的状态由当前的状态决定，那么我们在返回的Promise里里面执行当前的状态处理函数
         */
        return new MyPromise((reslove, reject) => {
            this.settledHandler(data => {
                if(typeof thenable !== "function"){
                    reslove(data);
                    return
                }
                exec(data, thenable, reslove, reject)
            }, this[thenables], RESLOVED);
            this.settledHandler(data => {
                if(typeof catchable !== "function"){
                    reject(data);
                    return
                }
                exec(data, catchable, reslove, reject)
            }, this[catchables], REJECTED);
        })
    }

    then(thenable, catchable){
        return this.linkPromise(thenable, catchable)
    }
    catch(catchable) {
        return this.linkPromise(undefined, catchable)
    }
    static all(proms) {
        return new MyPromise((resolve, reject) => {
            const results = proms.map(p => {
                const obj = {
                    result: undefined,
                    isResolved: false
                }
                p.then(data => {
                    obj.result = data;
                    obj.isResolved = true;
                    //判断是否所有的全部完成
                    const unResolved = results.filter(r => !r.isResolved)
                    if (unResolved.length === 0) {
                        //全部完成
                        resolve(results.map(r => r.result));
                    }
                }, reason => {
                    reject(reason);
                })
                return obj;
            })
        })
    }
    static race(proms) {
        return new MyPromise((resolve, reject) => {
            proms.forEach(p => {
                p.then(data => {
                    resolve(data);
                }, err => {
                    reject(err);
                })
            })
        })
    }
    static resolve(data) {
        if (data instanceof MyPromise) {
            return data;
        }
        else {
            return new MyPromise(resolve => {
                resolve(data);
            })
        }
    }
    static reject(reason) {
        return new MyPromise((resolve, reject) => {
            reject(reason);
        })
    }
}