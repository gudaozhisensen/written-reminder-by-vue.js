;
(function() {
    'use strict';

    var Event = new Vue();
    var alert_sound = document.getElementById("alert_sound");
    /*子组件,向父组件进行请求操作，父组件的监听在mounted里*/
    Vue.component('task', {
        template: '#task-tpl',
        props: ['todo'],
        methods: {
            action: function(name, params) {
                Event.$emit(name, params);
            }
        }
    })

    new Vue({
        el: '#main',
        data: {
            List: [],
            last_id: 0,
            current: {}
        },
        /*父级组件*/
        mounted: function() {
            var me = this;
            this.List = ms.get('List') || this.List;
            this.last_id = ms.get('last_id') || this.last_id;
            setInterval(function() {
                me.check_alert();
            }, 1000)

            Event.$on('remove', function(id) {
                if (id) {
                    me.remove(id);
                }
            });
            Event.$on('toggle_complete', function(id) {
                if (id) {
                    me.toggle_complete(id);
                }
            });
            Event.$on('set_current', function(id) {
                if (id) {
                    me.set_current(id);
                }
            });
            Event.$on('toggle_detail', function(id) {
                if (id) {
                    me.toggle_detail(id);
                }
            });
        },

        methods: {
            check_alert: function() {
                var me = this;
                this.List.forEach(function(row, i) {
                    var alert_at = row.alert_at;
                    if (!alert_at || row.alert_confirmed) return;
                    var alert_at = (new Date(alert_at)).getTime();
                    var now = (new Date()).getTime();

                    if (now >= alert_at) {
                        alert_sound.play();
                        var confirmed = confirm(row.title+'任务已过期');
                        Vue.set(me.List[i], 'alert_confirmed', confirmed);
                    }
                })
            },
            merge: function() {
                var is_update, id;
                is_update = id = this.current.id;

                if (is_update) {
                    var index = this.find_index_by_id(is_update);
                    Vue.set(this.List, index, copy(this.current));

                } else {
                    var title = this.current.title;
                    if (!title && title !== 0)
                        return;
                    var todo = copy(this.current);
                    this.last_id++;
                    todo.id = this.last_id;
                    ms.set('last_id', this.last_id);
                    console.log('last_id', this.last_id);
                    this.List.push(todo);
                }
                ms.set('List', this.List);
                this.reset_current();
            },

            remove: function(id) {
                var index = this.find_index_by_id(id);
                this.List.splice(index, 1);
                ms.set('List', this.List);
            },
            toggle_complete: function(id) {
                var i = this.find_index_by_id(id);
                Vue.set(this.List[i], 'completed', !this.List[i].completed);
            },
            toggle_detail: function(id) {
                var index = this.find_index_by_id(id);
                console.log('id', id);
                this.List[index].show_detail;
                Vue.set(this.List[index], 'show_detail', !this.List[index].show_detail);



            },


            /***不起作用****/
            // watch: {
            //     List: {  
            //         handler: function(n, o) {
            //             console.log(n);
            //             if (n) {

            //                 ms.set('List', n);
            //             } else {
            //                 ms.set('List', []);
            //             }
            //         }
            //     },
            //     deep:true
            // },


            next_id: function() {
                var next_id = this.List.length + 1;
                return next_id;

            },
            set_current: function(todo) {
                this.current = copy(todo);
            },
            reset_current: function() {
                this.set_current({});
            },
            find_index_by_id: function(id) {
                return this.List.findIndex(function(item) {
                    return item.id == id;
                });
            }


        }
    })


    function copy(obj) {
        return Object.assign({}, obj);

    }
})();
