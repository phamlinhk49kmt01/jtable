

(function ($) {

    var table = {
        data: {
            rows: [],
            total: 0,
            totals_filter: 0,
            skip: 0,
            limit: 30,
        },
        element: null,
        options: {
            paging: true,
            isShowSTT: true,
            selectRow: false,
            selectMultiRow: false,
            ajax: {
                url: null,
                type: 'post',
                data: null
            },
        },
        init: function (options) {
            let $loading = $(`
            <div class="jtable-loader hide">
                <div class="loader" >
                <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                width="40px" height="40px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve">
                <path fill="#000" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
                <animateTransform attributeType="xml"
                    attributeName="transform"
                    type="rotate"
                    from="0 25 25"
                    to="360 25 25"
                    dur="0.6s"
                    repeatCount="indefinite"/>
                </path>
                </svg> Loading ...
                </div>
            </div>
        `);

            Object.assign(table.options, options);

            let id = $(this).attr('id');

            let $parent = $(this).parent();
            $($(this)).remove();

            table.element = $(`<div id="${id}" class="jtable-view" >`);
            table.element.append($loading);
            table.element.append('<div class="jtable-header">');
            table.element.append('<div class="jtable-body">');
            table.element.append('<div class="jtable-footer">');

            $parent.prepend(table.element);
            table.renderHeader();

            if (typeof options.ajax.url != 'undefined') {
                table.getDataAjax();
            }
            else if (typeof options.data != 'undefined') {
                table.data.rows = options.data;
                table.renderBody();
            }
        },
        showLoading: function () {
            $('.jtable-loader').removeClass('hide');
        },
        hideLoading: function () {
            $('.jtable-loader').addClass('hide');
        },
        getDataAjax: function () {
            new Promise(function (resolve, reject) {

                if (table.options.ajax.url != null && table.options.paging) {
                    if (typeof table.options.ajax.data == 'undefined') {
                        table.options.ajax.data = {
                            limit: table.data.limit,
                            skip: table.data.skip
                        }
                    }
                    else {
                        Object.assign(table.options.ajax.data, {
                            limit: table.data.limit,
                            skip: table.data.skip
                        });
                    }

                }
                $.ajax({
                    url: table.options.ajax.url,
                    type: table.options.ajax.type,
                    data: table.options.ajax.data,
                    beforeSend: function () {
                        table.showLoading();
                    },
                    success: function (response) {
                        resolve(response);
                    },
                    error: function (error) {
                        reject(reject);
                    }
                });
            }).then(function (response) {
                if (typeof table.options.ajax.dataResponse != 'undefined') {
                    Object.assign(table.data, table.options.ajax.dataResponse(response));
                }
                else {
                    Object.assign(table.data, response);
                }
                table.renderBody();
                table.renderPaging();
                table.hideLoading();
            }).catch(function (error) {
                table.renderBody();
                table.renderPaging();
                table.hideLoading();
            });
        },
        renderHeader: function () {
            let $header = $(`.jtable-header`);
            let $headerRow = $(`<div class="jtable-header-row">`);

            if (table.options.isShowSTT) {
                table.options.columns.unshift({ title: '#', data: null })
            }

            if (table.options.selectRow) {
                table.options.columns.unshift({ title: '<input type="checkbox">', data: null, selectRow: true, selectMultiRow: table.options.selectMultiRow })
            }


            $header.append($headerRow);
            for (let indexColumn = 0; indexColumn < table.options.columns.length; indexColumn++) {
                const column = table.options.columns[indexColumn];
                let $headerItem = $(`<div class="jtable-header-item jtable-header-column-${indexColumn}" style="flex:1">`);
                $headerItem.html(column.title);
                $headerRow.append($headerItem);
            }
        },
        renderFooter: function () { },
        renderBody: function () {
            let _widthAvalible = $('.jtable-header').width();

            let _widthRowHeader = $('.jtable-header-item:last-child').offset().left - $('.jtable-header-row').offset().left + $('.jtable-header-item:last-child').width();

            if (_widthRowHeader < _widthAvalible) {
                $('.jtable-header-row').addClass('full-width');
            }

            console.time("render");
            let $body = $('.jtable-body');
            $body.empty();

            if (table.data.rows.length > 0) {
                $(`.jtable-header-item`).css('flex', '');
                let maxWidth = {};

                let totalRow = table.data.rows.length
                for (let indexRow = 0; indexRow < totalRow; indexRow++) {
                    const row = table.data.rows[indexRow];
                    let $row = $('<div class="jtable-body-row">');
                    $body.append($row);
                    for (let indexColumn = 0; indexColumn < table.options.columns.length; indexColumn++) {
                        const column = table.options.columns[indexColumn];

                        let content = "";
                        if (table.options.isShowSTT && column.title == '#') {

                            content = indexRow + 1;
                        }

                        else {

                            if (table.options.selectRow) {
                                content = '<input type="checkbox">';
                            }
                            else{
                                content = row[column.data];
                                if (typeof column.render != 'undefined') {
                                    content = column.render(row[column.data], row, indexRow);
                                }
                            }
                        }

                        let $cell = $(`<div class="jtable-body-cell jtable-body-column-${indexColumn}">`).html(content);
                        if (typeof column.cssClass != 'undefined') {
                            $cell.addClass(column.cssClass)
                        }

                        $row.append($cell);
                        let $header = $(`.jtable-header-item.jtable-header-column-${indexColumn}`);
                        let headerWidth = $header.width();
                        let cellWidth = $cell.width();
                        if (maxWidth[`jtable-body-column-${indexColumn}`] == undefined || maxWidth[`jtable-body-column-${indexColumn}`] < cellWidth) {


                            if (cellWidth < headerWidth) {
                                maxWidth[`jtable-body-column-${indexColumn}`] = headerWidth;
                                // $(`.jtable-header-column-${indexColumn}`).css('flex', '1');
                            }
                            else {
                                maxWidth[`jtable-body-column-${indexColumn}`] = cellWidth;
                                // $(`.jtable-header-column-${indexColumn}`).css('flex', '');
                            }
                        }
                        $(`.jtable-header-column-${indexColumn}`).css('width', maxWidth[`jtable-body-column-${indexColumn}`] + 'px');
                        $(`.jtable-body-column-${indexColumn}`).css('width', maxWidth[`jtable-body-column-${indexColumn}`] + 'px');
                    }
                }

                $body.on('scroll', function () {
                    var left = $body.scrollLeft();
                    if (table.currentScrollLeft != left) {
                        $('.jtable-header').scrollLeft(left);
                        table.currentScrollLeft = left;
                    }
                });

                if ($body.get(0).scrollHeight > $body.height()) {
                    let headerWidth = $('.jtable-header-row > :last').width();

                    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                        // no things
                    }
                    else {
                        $('.jtable-header-row >:last').css('width', `${headerWidth + 17}px`);
                    }

                }

            }
            else {
                $(`.jtable-header-item`).css('flex', '1');
                let $row = $('<div class="jtable-body-row-empty">').text('Chưa có dữ liệu');
                $body.append($row);
            }

            if (table.currentScrollLeft != undefined) {
                $('.jtable-header').scrollLeft(table.currentScrollLeft);
                $body.scrollLeft(table.currentScrollLeft);
            }
            table.renderPaging();

            console.timeEnd("render");

        },
        renderPaging: function () {

            let $footer = $(`.jtable-footer`);
            $footer.empty();

            if (!table.options.paging) {
                return;
            }

            let $pagingInfo = $('<div class="jtable-footer-paging-info width-50">');
            let $pagingButton = $('<div class="jtable-footer-paging-button width-50">');
            $footer.append($pagingButton);
            $footer.append($pagingInfo);
            $pagingInfo.html(`Hiển thị dòng ${table.data.skip + 1}  đến dòng ${table.data.rows.length + table.data.skip} trên ${table.data.total} dòng`);

            let $nextBtn = $(`<button class="btn-next" type="button">`).text('>');
            let $prevBtn = $('<button class="btn-prev" type="button">').text('<');

            $pagingButton.append($prevBtn);
            $pagingButton.append($nextBtn);

            let $totalPage = $('<span class="total-page">');
            $pagingButton.append($totalPage);
            table.updateTotalPage();

            $nextBtn.click(function (e) {
                e.stopPropagation();
                if (table.data.skip + table.data.rows.length < table.data.total) {
                    table.data.skip += table.data.limit;
                    console.log(table.data.skip)
                    table.getDataAjax();
                }
            });

            $prevBtn.click(function (e) {
                e.stopPropagation();
                if (table.data.skip >= table.data.limit) {
                    table.data.skip -= table.data.limit;
                    console.log(table.data.skip)
                    table.getDataAjax();
                }
            });


        },
        updateTotalPage: function () {

            let totalPage = 0;
            if (table.data.total % table.data.limit == 0) {
                totalPage = Math.floor(table.data.total / table.data.limit)
            }
            else {
                totalPage = Math.floor(table.data.total / table.data.limit) + 1;
            }

            let pageIndex = 1;
            if ((table.data.limit + table.data.skip) % table.data.limit == 0) {
                pageIndex = Math.floor((table.data.limit + table.data.skip) / table.data.limit);
            }
            else {
                pageIndex = Math.floor((table.data.limit + table.data.skip) / table.data.limit) + 1;
            }

            table.element.find('.total-page').html(`${pageIndex}&nbsp;/&nbsp;${totalPage}`);

        }
    }

    $.fn.JTable = function (options) {
        return table.init.apply(this, arguments);
    };
})(jQuery);