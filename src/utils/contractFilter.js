import { go, takeAll, filterL, find} from 'fff-js'

    const solidityType = [
        {name: "String", types : ["string","address","bytes","string[]","address[]","bytes[]","bool[]"]},
        {name: "Number", types : ["uint","int","uint[]","int[]"]},
        {name: "Bool", types : ["bool"]}
    ]

    let types = [
        {name:"uint", min:8, max:256, tum:8, type_index:1}, 
        {name:"int", min:8, max:256, tum:8, type_index:1}, 
        {name:"bytes", min:1, max:32, tum:1, type_index:0}, 
    ]

    types.forEach(val => {
        for(let i = val.min; i <= val.max; i+= val.tum){
            solidityType[val.type_index].types.push(val.name+i)
            solidityType[0].types.push(val.name+i+"[]")
        }
    })

    /**
     * @param { String } Solidity type  
     * @return { String } Javascript type (solidityType[n].name)
    */
    const checkType = type => go(
        solidityType,
        find(obj => obj.types.includes(type)),
        ({ name }) => name
    )

    /**
     * @param { Array } abi  
     * @return { Array } access modifier == view ( fee free function )
     * @dev read function filter
    */
    const readFunction = (abi) => go(
        abi,
        filterL(obj => 
            obj.constant === true 
            && obj.type === "function"),
        takeAll
    )

    /**
     * @param { Array } abi  
     * @return { Array } access modifier != view
     * @dev write function filter
    */
    const writeFunction = (abi) => go(
        abi,
        filterL(obj => 
            obj.constant === false
            && obj.type === "function"),
        takeAll
    )


export { readFunction, writeFunction, checkType }