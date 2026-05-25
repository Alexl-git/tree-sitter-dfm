object DataForm: TDataForm
  Left = 200
  Top = 200
  Caption = 'Collection Demo'
  ClientHeight = 280
  ClientWidth = 480
  object ListView1: TListView
    Left = 8
    Top = 8
    Width = 460
    Height = 200
    Columns = <
      item
        Caption = 'Name'
        Width = 120
      end
      item
        Caption = 'Value'
        Width = 80
      end
      item
        Alignment = taRightJustify
        Caption = 'Notes'
        Width = 240
      end>
    Items.ItemData = {
      05540000000300000000000000FFFFFFFFFFFFFFFF02000000000000000441
      6C70686107000000310030003000310003557476}
    TabOrder = 0
  end
  object StatusBar1: TStatusBar
    Left = 0
    Top = 254
    Width = 480
    Height = 19
    Panels = <
      item
        Text = 'Ready'
        Width = 200
      end
      item
        Alignment = taRightJustify
        Width = 50
      end>
  end
end
