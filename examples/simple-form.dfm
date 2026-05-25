object MainForm: TMainForm
  Left = 0
  Top = 0
  Caption = 'Sample Form'
  ClientHeight = 300
  ClientWidth = 400
  Color = clBtnFace
  Font.Charset = DEFAULT_CHARSET
  Font.Color = clWindowText
  Font.Height = -11
  Font.Name = 'Tahoma'
  Font.Style = []
  TextHeight = 13
  object Label1: TLabel
    Left = 16
    Top = 16
    Width = 32
    Height = 13
    Caption = 'Name:'
  end
  object Edit1: TEdit
    Left = 64
    Top = 13
    Width = 240
    Height = 21
    TabOrder = 0
    Text = 'Enter your name'
  end
  object Button1: TButton
    Left = 16
    Top = 48
    Width = 75
    Height = 25
    Caption = 'OK'
    Default = True
    ModalResult = 1
    TabOrder = 1
  end
  object Memo1: TMemo
    Left = 16
    Top = 88
    Width = 369
    Height = 197
    Lines.Strings = (
      'Line 1'
      'Line 2'
      'Line 3')
    ScrollBars = ssVertical
    TabOrder = 2
  end
end
