

(function ($) {

    var table = {
        data: [],
        element: null,
        options: null,
        init: function (options) {
            table.options = options;

            let id = $(this).attr('id');

            let $parent = $(this).parent();
            $($(this)).remove();
            table.element = $(`<div id="${id}" class="jtable-view" >`);
            $parent.prepend(table.element);
            table.renderHeader();

            if (typeof options.ajax != 'undefined') {
                table.getDataAjax().then(function (response) {
                    table.data = response.products;
                    console.log(response)
                    table.renderBody();
                });
            }
            else if(typeof options.data != 'undefined'){
                table.data =  options.data;
                table.renderBody();
            }
        },
        getDataAjax: function () {
            var promise = new Promise(function (resolve, reject) {
                $.ajax({
                    url: table.options.ajax.url,
                    type: table.options.ajax.type,
                    data: table.options.ajax.data,
                    success: function (response) {
                        resolve(response);
                    },
                    error: function (error) {
                        reject(reject);
                    }
                });
            });
            return promise;
        },
        renderHeader: function () {
            let $header = $(`<div class="jtable-header">`);
            let $headerRow = $(`<div class="jtable-header-row">`);
            $header.append($headerRow);
            for (let indexColumn = 0; indexColumn < table.options.columns.length; indexColumn++) {
                const column = table.options.columns[indexColumn];
                let $headerItem = $(`<div class="jtable-header-item jtable-header-column-${indexColumn}">`);
                $headerItem.text(column.title);
                $headerRow.append($headerItem);
            }
            table.element.append($header)
        },
        renderBody: function () {
            let _widthAvalible =  $('.jtable-header').width();

            let _widthRowHeader = $('.jtable-header-item:last-child').offset().left - $('.jtable-header-row').offset().left  + $('.jtable-header-item:last-child').width();


            console.log('_widthAvalible',_widthAvalible,'_widthRowHeader',_widthRowHeader);
            if(_widthRowHeader < _widthAvalible){
                $('.jtable-header-row').addClass('full-width');
            }

            console.time("render");
            let $body = $('<div class="jtable-body">');
            table.element.append($body)

            let maxWidth = {};

            for (let indexRow = 0; indexRow < table.data.length; indexRow++) {
                const row = table.data[indexRow];
                let $row = $('<div class="jtable-body-row">');
                $body.append($row);
                for (let indexColumn = 0; indexColumn < table.options.columns.length; indexColumn++) {
                    const column = table.options.columns[indexColumn];
                    let $cell = $(`<div class="jtable-body-cell jtable-body-column-${indexColumn}">`).text(row[column.data]);
                    $row.append($cell);
                    let $header = $(`.jtable-header-item.jtable-header-column-${indexColumn}`);
                    let headerWidth = $header.width();
                    let cellWidth = $cell.width();
                    if (maxWidth[`jtable-body-column-${indexColumn}`] == undefined || maxWidth[`jtable-body-column-${indexColumn}`] < cellWidth) {
                        if (cellWidth < headerWidth) {
                            maxWidth[`jtable-body-column-${indexColumn}`] = headerWidth;
                        }
                        else {
                            maxWidth[`jtable-body-column-${indexColumn}`] = cellWidth;
                        }
                    }
                    $(`.jtable-header-column-${indexColumn}`).css('width', maxWidth[`jtable-body-column-${indexColumn}`] + 'px');
                    $(`.jtable-body-column-${indexColumn}`).css('width', maxWidth[`jtable-body-column-${indexColumn}`] + 'px');
                }
            }

            let currentLeft = 0;
            $body.on('scroll', function () {
                var left = $body.scrollLeft();
                if (currentLeft != left) {
                    $('.jtable-header').scrollLeft(left);
                }
                currentLeft = left;
            });
            //console.log('scrollHeight', $body.get(0).scrollHeight, 'height', $body.height())
            if ($body.get(0).scrollHeight > $body.height()) {
                let headerWidth = $('.jtable-header-row > :last').width();
                $('.jtable-header-row >:last').css('width', `${headerWidth + 17}px`);
            }



            console.timeEnd("render");



        }
    }

    $.fn.JTable = function (options) {
        return table.init.apply(this, arguments);
    };
})(jQuery);