var page = {
    data: [],
    getData: function () {
        $('#my-table').JTable({
            ajax: {
                url:'https://dummyjson.com/products',
                type:'get',
                dataResponse: function(data){
                    return data.products;
                }
            }, 
            data: page.data,
            columns: [
                // {
                //     title: 'avata', data: 'thumbnail', render: function (data, row) {
                //         return `<img src="${data}" style="width: 150px"/>`;
                //     }
                // },
                { title: 'name', data: 'title', cssClass:'text-center'},
                { title: 'description',data:'description' },
                { title: 'price', data: 'price' },
                { title: 'discountPercentage', data: 'discountPercentage' },
                { title: 'stock', data: 'stock' },
                { title: 'rating', data: 'rating' },
                { title: 'brand', data: 'brand' },
                { title: 'category', data: 'category' },
            ]

        });
    }
}
$(function () {
    page.getData();
});