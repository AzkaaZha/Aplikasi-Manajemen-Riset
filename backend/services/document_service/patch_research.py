with open('app/api/routes/research.py', 'r', encoding='utf-8') as f:
    content = f.read()

target = """    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Laporan akhir berhasil dibuat","""

replacement = """    db.add(document)
    db.commit()
    db.refresh(document)

    # Clone data from proposal
    copy_document_data(db, proposal.id, document.id, template.id)

    return {
        "message": "Laporan akhir berhasil dibuat","""

if target in content:
    content = content.replace(target, replacement)
    with open('app/api/routes/research.py', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success")
else:
    print("Target not found")
