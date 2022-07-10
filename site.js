var page = {
    getData: function(){
        $('#my-table').JTable({
            ajax: {
                url:'https://dummyjson.com/products',
                type:'get',
                dataResponse: function(data){
                    return data;
                }
            }, 
            columns:[
                { title: 'name',data:'title' },
                 { title: 'description',data:'description' },
                { title: 'price',data:'price' },
                { title: 'discountPercentage',data:'discountPercentage' },
                { title: 'stock',data:'stock' },
                { title: 'rating',data:'rating' },
                { title: 'brand',data:'brand' },
                { title: 'category',data:'category' },
            ]
            
        });
    }
}
$(function(){
    page.getData();
});