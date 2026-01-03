import type { IPersonConfig } from '@/types/storeType'
import i18n from '@/locales/i18n'

interface IColumnsProps {
    showPrizeTime?: boolean
    handleDeletePerson: (row: IPersonConfig) => void
}

export function tableColumns(props: IColumnsProps) {
    return [
        {
            label: i18n.global.t('data.number'),
            props: 'lottery_code',
            sort: true,
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
            label: i18n.global.t('data.prizeName'),
            props: 'prizes',
            sort: true,
            formatValue(row: any) {
                const prizes = row.prizes || []
                if (prizes.length > 0) {
                    return prizes.map((p: any) => p.name).join(', ')
                }
                return '-'
            },
        },
        {
            label: i18n.global.t('data.operation'),
            actions: [
                {
                    label: i18n.global.t('data.removePerson'),
                    type: 'btn-info',
                    onClick: (row: IPersonConfig) => {
                        props.handleDeletePerson(row)
                    },
                },
            ],
        },
    ]
}
