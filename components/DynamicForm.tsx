export default function
DynamicForm({
 template
}:any){

 return(
  <div>

   {template.fields.map(
    (
     field:any,
     index:number
    )=>{

     switch(field.type){

      case "text":
       return(
        <input
         key={index}
         name={field.label}
        />
       );

      case "textarea":
       return(
        <textarea
         key={index}
         name={field.label}
        />
       );

      case "date":
       return(
        <input
         key={index}
         type="date"
         name={field.label}
        />
       );

      case "checkbox": {
       const options = Array.isArray(field.options)
        ? field.options
          .map((option:any) => String(option).trim())
          .filter(Boolean)
        : [];

       if(options.length){
        return(
         <div key={index}>
          {options.map((option:string) => (
           <label key={option}>
            <input
             type="checkbox"
             name={field.label}
             value={option}
            />
            {option}
           </label>
          ))}
         </div>
        );
       }

       return(
        <input
         key={index}
         type="checkbox"
         name={field.label}
        />
       );
      }
     }
    }
   )}

  </div>
 );
}
