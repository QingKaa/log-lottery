import type { IPersonConfig } from '@/types/storeType'
import i18n from '@/locales/i18n'

interface IColumnsProps {
    handleDeletePerson: (row: IPersonConfig) => void
}
export function tableColumns(props: IColumnsProps) {
    return [
        {
            label: i18n.global.t('data.number'),
            props: 'lottery_code',
        },
        {
            label: i18n.global.t('data.name'),
            props: 'name',
        },
        {
            label: '手机号码',
            props: 'phone',
            formatValue(row: any) {
                return row.phone || '-'
            },
        },
        {
            label: '公司',
            props: 'company',
            formatValue(row: any) {
                return row.company || '-'
            },
        },
        {
            label: '职位',
            props: 'position',
            formatValue(row: any) {
                return row.position || '-'
            },
        },
        {
            label: '是否签到',
            props: 'is_sign',
            formatValue(row: any) {
                return row.is_sign === 1
                    ? '<span class="badge badge-success">已签到</span>'
                    : '<span class="badge badge-ghost">未签到</span>'
            },
        },
        {
            label: i18n.global.t('data.isWin'),
            props: 'is_winner',
            formatValue(row: any) {
                if (row.is_winner === 1) {
                    const prizes = row.prizes || []
                    if (prizes.length > 0) {
                        const prizeNames = prizes.map((p: any) => p.name).join(', ')
                        return `<span class="badge badge-primary">${prizeNames}</span>`
                    }
                    return '<span class="badge badge-success">已中奖</span>'
                }
                return '<span class="badge badge-ghost">未中奖</span>'
            },
        },
        {
            label: i18n.global.t('data.operation'),
            actions: [
                {
                    label: i18n.global.t('data.delete'),
                    type: 'btn-error',
                    onClick: (row: IPersonConfig) => {
                        props.handleDeletePerson(row)
                    },
                },

            ],
        },
    ]
}
