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
     }
    }
   )}

  </div>
 );
}