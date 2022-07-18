var page = {
    data: [],
    getData: function () {
        $('#my-table').JTable({
            selectRow: true,
            selectMultiRow: true,
            onSelectRow: function(data){
                console.log(data);
            },
            onSelectAllRow: function(datas){
                console.log(datas);
            },
            ajax: {
                url: 'https://dummyjson.com/products',
                type: 'get',
                dataResponse: function (data) {
                    return {
                        rows: data.products,
                        total: data.total
                    };
                }
            },
            data: page.data,
            columns: [
                { title: 'name', data: 'title', cssClass: 'text-center' },
              //  { title: 'description', data: 'description' },
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